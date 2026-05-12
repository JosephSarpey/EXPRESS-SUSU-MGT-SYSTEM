import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveAccountDto {
  @ApiPropertyOptional({ example: 'Verified ID document.' })
  @IsString()
  @IsOptional()
  remarks?: string;
}
