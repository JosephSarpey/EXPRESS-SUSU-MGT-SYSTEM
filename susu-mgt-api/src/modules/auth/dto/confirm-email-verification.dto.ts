import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmEmailVerificationDto {
  @ApiProperty({
    description:
      'Supabase access token received from the email verification redirect hash',
    example: 'eyJhbGciOi...',
  })
  @IsString()
  accessToken: string;

  @ApiPropertyOptional({
    description: 'Type of verification',
    enum: ['signup', 'recovery', 'email_change'],
    example: 'signup',
  })
  @IsString()
  @IsOptional()
  type?: 'signup' | 'recovery' | 'email_change';
}
