import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CATEGORIES, MAX_AMOUNT } from '../common/constants';
import { trim } from '../common/validation';

const amount = { message: 'Amount must be a valid amount' };

export class CreateExpenseDto {
  @IsInt(amount)
  @Min(1, amount)
  @Max(MAX_AMOUNT, amount)
  amount: number;

  @IsIn(CATEGORIES, { message: 'Pick a category' })
  category: string;

  @IsString({ message: 'Pick a valid date' })
  date: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'Note must be text' })
  @MaxLength(140, { message: 'Note is too long' })
  note?: string;
}
