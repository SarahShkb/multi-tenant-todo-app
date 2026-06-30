import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { MembershipRole } from '../entities/user-tenant.entity';

export class AddMemberDto {
  // Admin provides an email — we look up the user account server-side.
  // This way the admin never needs to know or guess a userId UUID.
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(MembershipRole)
  role?: MembershipRole;
}
