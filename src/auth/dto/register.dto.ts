import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterRequest {
  @IsString({ message: 'Login must be a string' })
  @IsNotEmpty({ message: 'Login must not be empty' })
  login: string;

  @IsEmail({}, { message: 'Email must be a valid email' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password must be at most 20 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Age must not be empty' })
  age: number;
}
