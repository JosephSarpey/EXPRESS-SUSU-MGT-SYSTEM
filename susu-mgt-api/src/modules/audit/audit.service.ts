/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiomWithoutBatching } from '@axiomhq/js';
import { AuditEvent } from '../../common/interfaces/audit.interface.js';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly axiom: AxiomWithoutBatching;
  private readonly dataset: string;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('AXIOM_API_TOKEN');
    const url = this.configService.get<string>('AXIOM_URL');
    this.dataset =
      this.configService.get<string>('AXIOM_DATASET') || 'susu-audit-logs';

    if (token) {
      const axiomOptions: any = { token };
      if (url) {
        if (url.includes('.edge.')) {
          axiomOptions.edgeUrl = url;
        } else {
          axiomOptions.url = url;
        }
      }
      this.axiom = new AxiomWithoutBatching(axiomOptions);
    } else {
      this.logger.warn(
        'Axiom API Token not configured. Audit logs will only be printed to console.',
      );
    }
  }

  async logEvent(event: AuditEvent): Promise<void> {
    const logEntry = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    if (this.axiom) {
      try {
        await this.axiom.ingest(this.dataset, [logEntry]);
      } catch (error) {
        this.logger.error('Failed to send audit log to Axiom', error);
      }
    } else {
      this.logger.log(`[AUDIT] ${JSON.stringify(logEntry)}`);
    }
  }

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    if (!this.axiom) {
      const limit = params.limit || 10;
      const page = params.page || 1;
      return {
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        message: 'Axiom is not configured',
      };
    }

    try {
      const limit = params.limit || 10;
      const page = params.page || 1;
      // Basic APL query for Axiom
      let query = `['${this.dataset}']`;
      if (params.search) {
        query += ` | where action == "${params.search}" or actorId == "${params.search}"`;
      }
      query += ` | sort by _time desc | limit ${limit}`;

      // Axiom's APL query doesn't strictly support pagination offsets natively in the same way SQL does,
      // but we can query and return results. To do true pagination, we might just rely on limit and time range.
      // For simplicity in this implementation, we will just use APL limit.
      const res = await this.axiom.query(query, {
        startTime: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        endTime: new Date().toISOString(),
        format: 'legacy',
      });

      const total = res.status?.rowsExamined || 0;
      return {
        data: res.matches?.map((match) => match.data) || [],
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to retrieve audit logs from Axiom', error);
      throw error;
    }
  }
}
