import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { Prisma } from '../../generated/prisma/client.js';
import { TransactionsService } from '../transactions/transactions.service.js';

type PaystackWebhookPayload = {
  event?: string;
  data?: {
    status?: string;
    reference?: string;
    amount?: number;
    metadata?: {
      userId?: string;
    };
  };
};

@Controller('webhooks/paystack')
export class PaystackWebhookController {
  constructor(
    private readonly config: ConfigService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  async handle(
    @Req() req: { body: unknown; rawBody?: Buffer },
    @Headers('x-paystack-signature') signature?: string,
  ) {
    const secret = this.config.get<string>('PAYSTACK_WEBHOOK_SECRET');
    if (!secret) {
      throw new UnauthorizedException(
        'PAYSTACK_WEBHOOK_SECRET is not configured',
      );
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    if (!signature) {
      throw new UnauthorizedException('Missing webhook signature');
    }

    const expected = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (expected !== signature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const payload = req.body as PaystackWebhookPayload;
    if (payload.event !== 'charge.success') {
      return { ok: true };
    }

    const reference = payload.data?.reference;
    const status = payload.data?.status;
    const amountInKobo = payload.data?.amount;
    const userId = payload.data?.metadata?.userId;

    if (!reference || status !== 'success' || !amountInKobo || !userId) {
      throw new BadRequestException('Invalid webhook payload');
    }

    const amount = amountInKobo / 100;

    const gatewayResponse: Prisma.InputJsonValue = JSON.parse(
      JSON.stringify(payload),
    ) as Prisma.InputJsonValue;

    const tx = await this.transactionsService.applyPaystackSuccessWebhook({
      referenceId: reference,
      userId,
      amount,
      gatewayResponse,
    });

    return { ok: true, transactionId: tx.id, status: tx.status };
  }
}
