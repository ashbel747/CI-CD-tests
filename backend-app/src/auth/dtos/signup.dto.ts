import { IsEmail, IsString, Matches, MinLength, IsEnum } from 'class-validator';

export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
}

export class SignupDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
