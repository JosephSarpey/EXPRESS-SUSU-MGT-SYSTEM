import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [ConfigModule, forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
