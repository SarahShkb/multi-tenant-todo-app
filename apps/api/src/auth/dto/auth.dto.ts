import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  // The tenant slug the user is joining (e.g. "acme-corp").
  // If it doesn't exist, a new tenant is created with this slug.
  @IsString()
  tenantSlug: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
