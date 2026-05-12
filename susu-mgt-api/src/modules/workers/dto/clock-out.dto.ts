import { IsOptional, IsString } from 'class-validator';

export class ClockOutDto {
  @IsOptional()
  @IsString()
  remarks?: string;
}
