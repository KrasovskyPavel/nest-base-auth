import { IsNotEmpty } from 'class-validator';

export class LoginRequest {
  @IsNotEmpty({ message: 'Identifier required' })
  identifier: string;

  @IsNotEmpty({ message: 'Password required' })
  password: string;
}
