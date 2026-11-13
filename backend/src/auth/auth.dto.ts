import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsInt, IsString, Length, Max, MaxLength, Min, MinLength } from 'class-validator';
import { CURRENCIES, MAX_AMOUNT } from '../common/constants';
import { trim, trimLower } from '../common/validation';

export class SignupDto {
  @Transform(trim)
  @IsString({ message: 'Name is required' })
  @Length(1, 60, { message: 'Name is required (up to 60 characters)' })
  name: string;

  @Transform(trimLower)
  @IsString({ message: 'Enter a valid email address' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  @MaxLength(200, { message: 'Email is too long' })
  email: string;

  @IsString({ message: 'Password must be at least 8 characters' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(200, { message: 'Password is too long' })
  password: string;
}

export class LoginDto {
  @Transform(trimLower)
  @IsString({ message: 'Enter your email and password' })
  @MaxLength(200, { message: 'Wrong email or password' })
  email: string;

  @IsString({ message: 'Enter your email and password' })
  @MaxLength(200, { message: 'Wrong email or password' })
  password: string;
}

const amount = (label: string) => ({ message: `${label} must be a valid amount` });

export class SettingsDto {
  @Transform(trim)
  @IsString({ message: 'Name is required' })
  @Length(1, 60, { message: 'Name is required (up to 60 characters)' })
  name: string;

  @IsIn(CURRENCIES, { message: 'Unsupported currency' })
  currency: string;

  @IsInt(amount('Monthly income'))
  @Min(0, amount('Monthly income'))
  @Max(MAX_AMOUNT, amount('Monthly income'))
  income: number;

  @IsInt(amount('Fixed bills'))
  @Min(0, amount('Fixed bills'))
  @Max(MAX_AMOUNT, amount('Fixed bills'))
  fixed: number;

  @IsInt(amount('Savings goal'))
  @Min(0, amount('Savings goal'))
  @Max(MAX_AMOUNT, amount('Savings goal'))
  savings: number;
}
