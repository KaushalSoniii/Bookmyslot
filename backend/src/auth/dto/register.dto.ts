import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'will mate', description: 'Full name' })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'willmate@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!', writeOnly: true })
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: ['client', 'provider'], example: 'provider' })
  @IsOptional()
  @IsEnum(['client', 'provider'])
  role!: 'client' | 'provider';
}