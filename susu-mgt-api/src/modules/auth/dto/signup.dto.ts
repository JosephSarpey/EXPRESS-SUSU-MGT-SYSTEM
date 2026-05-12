import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+233123456789',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'URL to redirect to after email verification',
    example: 'http://localhost:3000/auth/callback',
  })
  @IsString()
  @IsOptional()
  redirectTo?: string;
}
