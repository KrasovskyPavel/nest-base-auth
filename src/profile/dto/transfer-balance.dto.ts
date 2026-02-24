import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class TransferBalanceDto {
  @IsNotEmpty()
  @IsUUID()
  toUserId: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0.01, { message: 'Amount must be at least 0.01' })
  amount: number;
}
