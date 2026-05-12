import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { PaystackWebhookController } from './paystack-webhook.controller.js';

@Module({
  imports: [ConfigModule, TransactionsModule],
  controllers: [PaystackWebhookController],
})
export class WebhooksModule {}
