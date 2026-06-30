import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import {
  UserTenant,
  MembershipRole,
} from '../tenants/entities/user-tenant.entity';
import {
  SignupDto,
  LoginDto,
  SelectTenantDto,
  SwitchTenantDto,
} from './dto/auth.dto';
import { JwtPayload } from '../common/strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,

    @InjectRepository(UserTenant)
    private readonly membershipRepo: Repository<UserTenant>,

    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Find or create the tenant by slug.
    let tenant = await this.tenantRepo.findOne({
      where: { slug: dto.tenantSlug },
    });

    let isNewTenant = false;
    if (!tenant) {
      tenant = this.tenantRepo.create({
        slug: dto.tenantSlug,
        name: dto.tenantSlug,
      });
      await this.tenantRepo.save(tenant);
      isNewTenant = true;
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });
    await this.userRepo.save(user);

    // First member of a brand-new tenant becomes admin;
    // anyone joining an existing tenant becomes a regular member.
    const membership = this.membershipRepo.create({
      userId: user.id,
      tenantId: tenant.id,
      role: isNewTenant ? MembershipRole.ADMIN : MembershipRole.MEMBER,
    });
    await this.membershipRepo.save(membership);

    // A brand-new user only ever has exactly one tenant, so we can
    // safely issue a scoped JWT immediately — no selection step needed.
    return this.buildTokenResponse(user, tenant.id);
  }

  /**
   * STEP 1 of login.
   * Verifies email + password only. Does NOT issue a JWT, since we don't
   * yet know which tenant context the session should run in.
   * Returns the list of tenants this user can log into.
   */
  async login(dto: LoginDto) {
    const user = await this.validateCredentials(dto.email, dto.password);

    const memberships = await this.membershipRepo.find({
      where: { userId: user.id },
      relations: ['tenant'],
      order: { createdAt: 'ASC' },
    });

    if (memberships.length === 0) {
      throw new UnauthorizedException('User has no tenant memberships');
    }

    return {
      tenants: memberships.map((m) => ({
        id: m.tenant.id,
        name: m.tenant.name,
        slug: m.tenant.slug,
        role: m.role,
      })),
    };
  }

  /**
   * STEP 2 of login.
   * Frontend calls this after the user picks one of the tenants
   * returned by login(). Re-verifies credentials + membership,
   * then issues the actual JWT scoped to that tenant.
   *
   * We re-check the password here (rather than trusting a short-lived
   * "pre-auth" token from step 1) to keep the flow stateless and simple —
   * no extra token type to design, sign, or expire. The tradeoff is the
   * frontend must hold the password in memory between the two calls
   * (e.g. in a form's local state), not persist it anywhere.
   */
  async selectTenant(dto: SelectTenantDto) {
    const user = await this.validateCredentials(dto.email, dto.password);

    const membership = await this.membershipRepo.findOne({
      where: { userId: user.id, tenantId: dto.tenantId },
    });

    if (!membership) {
      throw new UnauthorizedException('Not a member of this tenant');
    }

    return this.buildTokenResponse(user, dto.tenantId);
  }

  /**
   * Switch the active tenant for an ALREADY-authenticated user
   * (has a valid JWT), without re-entering a password.
   */
  async switchTenant(userId: string, dto: SwitchTenantDto) {
    const membership = await this.membershipRepo.findOne({
      where: { userId, tenantId: dto.tenantId },
    });
    if (!membership) {
      throw new UnauthorizedException('Not a member of this tenant');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.buildTokenResponse(user, dto.tenantId);
  }

  private async validateCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private buildTokenResponse(user: User, activeTenantId: string) {
    const payload: JwtPayload = {
      sub: user.id,
      activeTenantId,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        activeTenantId,
      },
    };
  }
}
