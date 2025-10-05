import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginRequest {
  @ApiProperty({
    description: 'User login or email',
    example: 'John_Doe',
  })
  @IsNotEmpty({ message: 'Identifier required' })
  identifier: string;

  @ApiProperty({
    description: 'Password',
    example: '123asdf',
    minLength: 6,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Password required' })
  password: string;
}
