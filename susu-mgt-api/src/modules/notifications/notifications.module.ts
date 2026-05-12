import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsWorker } from './notifications.worker.js';

@Module({
  imports: [ConfigModule, UsersModule, AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsWorker],
  exports: [NotificationsService],
})
export class NotificationsModule {}
