import {
  IsEnum,
  IsNumber,
  type IsNumberOptions,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../../generated/prisma/client.js';

const amountNumberOptions: IsNumberOptions = { maxDecimalPlaces: 2 };

export class WorkerCreateWithdrawalDto {
  @IsUUID()
  userId!: string;

  @IsNumber(amountNumberOptions)
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  description?: string;
}
