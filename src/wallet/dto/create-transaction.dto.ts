import { IsString, IsNumber, IsIn, IsNotEmpty } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsIn(['deposit', 'withdrawal'])
  type: 'deposit' | 'withdrawal';

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;
}
