import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

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

// Step 1: plain credential check. Does NOT return a JWT —
// only the list of tenants this user can log into.
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

// Step 2: user has picked a tenant from the list returned by login.
// We re-verify credentials + membership and THEN issue the JWT.
export class SelectTenantDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsUUID()
  tenantId: string;
}

// Used by an already-authenticated user to switch their active
// tenant without re-entering a password (uses the existing JWT).
export class SwitchTenantDto {
  @IsUUID()
  tenantId: string;
}
