import { IsNumber, type IsNumberOptions, Min } from 'class-validator';

const amountNumberOptions: IsNumberOptions = { maxDecimalPlaces: 2 };

export class PaystackInitializeDto {
  @IsNumber(amountNumberOptions)
  @Min(0.01)
  amount!: number;
}
