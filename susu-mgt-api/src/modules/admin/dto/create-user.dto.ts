import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/client.js';

export class CreateUserDto {
  @ApiProperty({ example: 'user@susu.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiPropertyOptional({ example: '+233541234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: [Role.ADMIN, Role.WORKER, Role.CUSTOMER], example: Role.CUSTOMER })
  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;
}

