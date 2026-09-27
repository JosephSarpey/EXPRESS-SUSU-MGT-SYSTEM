import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { WorkersService } from './workers.service.js';
import { WorkersController } from './workers.controller.js';

@Module({
  imports: [ConfigModule, UsersModule, NotificationsModule, AuthModule, TransactionsModule],
  controllers: [WorkersController],
  providers: [WorkersService],
  exports: [WorkersService],
})
export class WorkersModule {}
