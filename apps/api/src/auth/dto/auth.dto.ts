import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  // The tenant slug the user is joining (e.g. "acme-corp").
  // If it doesn't exist, a new tenant is created with this slug,
  // and the signing-up user becomes its first member (admin).
  @IsString()
  tenantSlug: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  // Optional: which org to log into. Required only if the user
  // belongs to more than one tenant — otherwise we pick their
  // only membership automatically.
  @IsOptional()
  @IsString()
  tenantSlug?: string;
}

export class SwitchTenantDto {
  @IsString()
  tenantSlug: string;
}
