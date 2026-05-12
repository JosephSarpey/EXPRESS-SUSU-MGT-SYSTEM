import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/client.js';

export class CreateStaffDto {
  @ApiProperty({ example: 'staff@susu.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'John Staff' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiPropertyOptional({ example: '+233541234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: [Role.ADMIN, Role.WORKER], example: Role.WORKER })
  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;
}
