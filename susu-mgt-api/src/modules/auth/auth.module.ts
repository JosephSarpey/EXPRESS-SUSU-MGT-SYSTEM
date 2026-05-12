import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { SupabaseJwtGuard } from './supabase-jwt.guard.js';
import { SupabaseService } from './supabase.service.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [ConfigModule, forwardRef(() => UsersModule)],
  controllers: [AuthController],
  providers: [SupabaseJwtGuard, SupabaseService],
  exports: [SupabaseJwtGuard, SupabaseService, UsersModule],
})
export class AuthModule {}
