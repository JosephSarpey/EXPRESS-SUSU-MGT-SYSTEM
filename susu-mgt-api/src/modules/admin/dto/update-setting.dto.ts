import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiProperty({ example: 'min_withdrawal_amount' })
  @IsString()
  @IsNotEmpty()
  settingKey!: string;

  @ApiProperty({ example: '50.00' })
  @IsString()
  @IsNotEmpty()
  settingValue!: string;

  @ApiPropertyOptional({ example: 'The minimum amount allowed for a withdrawal' })
  @IsString()
  @IsOptional()
  description?: string;
}
