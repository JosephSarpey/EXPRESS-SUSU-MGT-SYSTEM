import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
  IsUrl,
  IsOptional,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 5000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  DIRECT_URL: string;

  @IsUrl({ require_tld: false })
  SUPABASE_URL: string;

  @IsString()
  SUPABASE_SERVICE_ROLE_KEY: string;

  @IsString()
  RESEND_API_KEY: string;

  @IsString()
  RESEND_FROM_EMAIL: string;

  @IsString()
  PAYSTACK_SECRET_KEY: string;

  @IsString()
  PAYSTACK_WEBHOOK_SECRET: string;

  @IsString()
  @IsOptional()
  ALLOWED_ORIGINS: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  BACKUP_RETENTION_DAYS: number = 7;

  @IsString()
  @IsOptional()
  BACKUP_CRON: string = '0 2 * * *';
}

export function validate(config: Record<string, any>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.toString()}`);
  }
  return validatedConfig;
}
