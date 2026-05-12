import { IsOptional, IsString } from 'class-validator';

export class ClockInDto {
  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
