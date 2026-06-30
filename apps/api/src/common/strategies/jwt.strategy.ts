import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserTenant } from '../../tenants/entities/user-tenant.entity';

export interface JwtPayload {
  sub: string; // user id
  activeTenantId: string; // the tenant this session is currently "inside"
  email: string;
}

// req.user is now this shape: the full User entity plus the
// resolved tenantId for this session. Every controller/service
// reads .tenantId from here instead of from the User entity itself.
export interface AuthenticatedUser extends User {
  tenantId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(UserTenant)
    private readonly membershipRepo: Repository<UserTenant>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'change-me',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Re-verify membership on every request. This matters because a user's
    // access to activeTenantId could have been revoked after the token was
    // issued (e.g. removed from the org) — we don't want a stale JWT to
    // keep granting access.
    const membership = await this.membershipRepo.findOne({
      where: { userId: user.id, tenantId: payload.activeTenantId },
    });

    if (!membership) {
      throw new UnauthorizedException('No active membership in this tenant');
    }

    return { ...user, tenantId: payload.activeTenantId };
  }
}