import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterRequest {
  @ApiProperty({
    description: 'User login',
    example: 'John_Doe',
  })
  @IsString({ message: 'Login must be a string' })
  @IsNotEmpty({ message: 'Login must not be empty' })
  login: string;

  @ApiProperty({
    description: 'Email',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @ApiProperty({
    description: 'Password',
    example: '123asdf',
    minLength: 6,
    maxLength: 20,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password must be at most 20 characters long' })
  password: string;

  @ApiProperty({
    description: 'Age',
    example: 12,
  })
  @IsNotEmpty({ message: 'Age must not be empty' })
  age: number;

  @ApiProperty({
    description: 'Description about user',
    example: 'I am John Doe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
