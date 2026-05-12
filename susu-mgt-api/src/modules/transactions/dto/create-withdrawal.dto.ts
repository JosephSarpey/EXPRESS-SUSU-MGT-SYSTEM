import { IsEnum, IsNumber, type IsNumberOptions, Min } from 'class-validator';
import { PaymentMethod } from '../../../generated/prisma/client.js';

const amountNumberOptions: IsNumberOptions = { maxDecimalPlaces: 2 };

export class CreateWithdrawalDto {
  @IsNumber(amountNumberOptions)
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
