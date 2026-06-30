import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
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
import { SignupDto, LoginDto, SwitchTenantDto } from './dto/auth.dto';
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

    // Create the membership row. First member of a brand-new tenant
    // becomes admin; anyone joining an existing tenant becomes a member.
    const membership = this.membershipRepo.create({
      userId: user.id,
      tenantId: tenant.id,
      role: isNewTenant ? MembershipRole.ADMIN : MembershipRole.MEMBER,
    });
    await this.membershipRepo.save(membership);

    return this.buildTokenResponse(user, tenant.id);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const memberships = await this.membershipRepo.find({
      where: { userId: user.id },
      relations: ['tenant'],
    });

    if (memberships.length === 0) {
      throw new UnauthorizedException('User has no tenant memberships');
    }

    let activeTenantId: string;

    if (dto.tenantSlug) {
      // User specified which org to log into — verify they're a member.
      const match = memberships.find((m) => m.tenant.slug === dto.tenantSlug);
      if (!match) {
        throw new UnauthorizedException('Not a member of this tenant');
      }
      activeTenantId = match.tenantId;
    } else if (memberships.length === 1) {
      // Only one tenant — no ambiguity, pick it automatically.
      activeTenantId = memberships[0].tenantId;
    } else {
      // Multiple tenants and none specified — caller must choose.
      throw new BadRequestException({
        message: 'User belongs to multiple tenants — specify tenantSlug',
        tenants: memberships.map((m) => ({
          slug: m.tenant.slug,
          name: m.tenant.name,
        })),
      });
    }

    return this.buildTokenResponse(user, activeTenantId);
  }

  // Switch the active tenant for an already-authenticated user,
  // without requiring them to log in again with a password.
  async switchTenant(userId: string, dto: SwitchTenantDto) {
    const tenant = await this.tenantRepo.findOne({
      where: { slug: dto.tenantSlug },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const membership = await this.membershipRepo.findOne({
      where: { userId, tenantId: tenant.id },
    });
    if (!membership) {
      throw new UnauthorizedException('Not a member of this tenant');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.buildTokenResponse(user, tenant.id);
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
