import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'URL to redirect to after password reset',
    example: 'http://localhost:3000/auth/reset-password',
  })
  @IsString()
  @IsOptional()
  redirectTo?: string;
}

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'New password',
    example: 'newpassword123',
    minLength: 6,
  })
  @IsString()
  password: string;
}
