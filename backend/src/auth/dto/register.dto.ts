import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(['client', 'provider'])
  role: 'client' | 'provider';
}