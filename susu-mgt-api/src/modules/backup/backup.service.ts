import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../auth/supabase.service.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Backup cron removed; now handled by GitHub Actions (.github/workflows/db-backup.yml)
  // @Cron(process.env.BACKUP_CRON || '0 2 * * *')
  async handleCronBackup() {
    this.logger.log('Starting scheduled database backup...');
    await this.createBackup();
    await this.cleanOldBackups();
  }

  async createBackup() {
    const directUrl = this.configService.get<string>('DIRECT_URL');
    if (!directUrl) {
      this.logger.error(
        'DIRECT_URL is not defined in environment variables. Cannot backup.',
      );
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const format = 'c'; // PostgreSQL custom format (compressed)
    const filename = `backup-${timestamp}.dump`;
    const filepath = path.join(this.backupDir, filename);

    try {
      this.logger.log(`Running pg_dump to file: ${filename}`);

      const command = `pg_dump "${directUrl}" -F ${format} -f "${filepath}"`;

      await execAsync(command);
      this.logger.log(`Local backup created successfully: ${filepath}`);

      // Upload to Supabase Storage
      await this.uploadToSupabase(filename, filepath);
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`);
    }
  }

  private async uploadToSupabase(filename: string, filepath: string) {
    try {
      this.logger.log(`Uploading ${filename} to Supabase Storage...`);
      const supabase = this.supabaseService.getClient();

      const fileBuffer = fs.readFileSync(filepath);

      const { data, error } = await supabase.storage
        .from('database-backups')
        .upload(filename, fileBuffer, {
          contentType: 'application/octet-stream',
          upsert: true,
        });

      if (error) {
        this.logger.error(`Supabase upload failed: ${error.message}`);
      } else {
        this.logger.log(
          `Backup successfully uploaded to Supabase Storage: ${data?.path}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to upload backup to Supabase: ${error.message}`,
      );
    }
  }

  async cleanOldBackups() {
    const retentionDays =
      this.configService.get<number>('BACKUP_RETENTION_DAYS') || 7;
    const now = Date.now();
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

    try {
      const files = fs.readdirSync(this.backupDir);
      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtimeMs > retentionMs) {
          fs.unlinkSync(filePath);
          this.logger.log(`Deleted old local backup: ${file}`);
        }
      }

      // Also clean up Supabase storage
      await this.cleanSupabaseBackups(retentionMs, now);
    } catch (error) {
      this.logger.error(`Failed to clean old backups: ${error.message}`);
    }
  }

  private async cleanSupabaseBackups(retentionMs: number, now: number) {
    try {
      const supabase = this.supabaseService.getClient();
      const { data: files, error: listError } = await supabase.storage
        .from('database-backups')
        .list();

      if (listError) {
        this.logger.error(
          `Failed to list Supabase backups: ${listError.message}`,
        );
        return;
      }

      if (!files || files.length === 0) return;

      const filesToDelete = files
        .filter((file) => {
          if (!file.created_at) return false;
          const createdAt = new Date(file.created_at).getTime();
          return now - createdAt > retentionMs;
        })
        .map((file) => file.name);

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('database-backups')
          .remove(filesToDelete);

        if (deleteError) {
          this.logger.error(
            `Failed to delete old Supabase backups: ${deleteError.message}`,
          );
        } else {
          this.logger.log(
            `Deleted ${filesToDelete.length} old backups from Supabase Storage.`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to clean old Supabase backups: ${error.message}`,
      );
    }
  }
}
