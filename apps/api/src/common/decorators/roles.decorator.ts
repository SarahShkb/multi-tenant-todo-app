import { SetMetadata } from '@nestjs/common';
import { MembershipRole } from '../../tenants/entities/user-tenant.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: MembershipRole[]) =>
  SetMetadata(ROLES_KEY, roles);
