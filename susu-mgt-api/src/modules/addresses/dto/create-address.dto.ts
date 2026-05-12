import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({ example: 'Accra' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Greater Accra' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: '00233' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this is the primary address',
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
