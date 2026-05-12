import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { PaystackService } from './paystack.service.js';
import { PaymentsController } from './payments.controller.js';

@Module({
  imports: [AuthModule, ConfigModule, UsersModule, TransactionsModule],
  controllers: [PaymentsController],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaymentsModule {}
