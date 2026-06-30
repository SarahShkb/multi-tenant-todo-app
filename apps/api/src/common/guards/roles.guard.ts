import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLES_KEY } from '../decorators/roles.decorator';
import {
  UserTenant,
  MembershipRole,
} from '../../tenants/entities/user-tenant.entity';
import { AuthenticatedUser } from '../strategies/jwt.strategy';

/**
 * Guards routes that require a specific membership role (e.g. admin).
 * Must be used AFTER JwtAuthGuard so req.user is already populated.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles(MembershipRole.ADMIN)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    @InjectRepository(UserTenant)
    private readonly membershipRepo: Repository<UserTenant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<MembershipRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @Roles() decorator, the route is open to all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    // Look up the user's actual role in the active tenant.
    // We re-query here rather than embedding role in the JWT
    // so that role changes take effect immediately without requiring
    // the user to log out and back in.
    const membership = await this.membershipRepo.findOne({
      where: { userId: user.id, tenantId: user.tenantId },
    });

    if (!membership || !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}