import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Verification token from email',
    example: '123456',
  })
  @IsString()
  token: string;

  @ApiPropertyOptional({
    description: 'Type of verification',
    enum: ['signup', 'recovery', 'email_change'],
    example: 'signup',
  })
  @IsString()
  @IsOptional()
  type?: 'signup' | 'recovery' | 'email_change';
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'URL to redirect to after email verification',
    example: 'http://localhost:3000/auth/callback',
  })
  @IsString()
  @IsOptional()
  redirectTo?: string;
}
