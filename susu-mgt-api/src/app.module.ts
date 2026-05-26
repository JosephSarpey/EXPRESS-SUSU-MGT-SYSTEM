import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { TransactionsModule } from './modules/transactions/transactions.module.js';
import { WalletsModule } from './modules/wallets/wallets.module.js';
import { WebhooksModule } from './modules/webhooks/webhooks.module.js';
import { WorkersModule } from './modules/workers/workers.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { AddressesModule } from './modules/addresses/addresses.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { validate } from './config/env.validation.js';

@Module({
  imports: [
    ConfigModule.forRoot({ validate }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 60 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
    PaymentsModule,
    WebhooksModule,
    WorkersModule,
    AdminModule,
    NotificationsModule,
    AddressesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
