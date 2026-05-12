import {
  IsNumber,
  type IsNumberOptions,
  Min,
  IsString,
  IsUUID,
} from 'class-validator';

const amountNumberOptions: IsNumberOptions = { maxDecimalPlaces: 2 };

export class CashDepositDto {
  @IsUUID()
  userId!: string;

  @IsNumber(amountNumberOptions)
  @Min(0.01)
  amount!: number;

  @IsString()
  description?: string;
}
