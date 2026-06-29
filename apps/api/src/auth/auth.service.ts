import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { SignupDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from '../common/strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,

    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    // Check if email is already taken
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    // Find or create tenant by slug.
    // If "acme-corp" doesn't exist yet, we create it on first signup.
    let tenant = await this.tenantRepo.findOne({
      where: { slug: dto.tenantSlug },
    });

    if (!tenant) {
      tenant = this.tenantRepo.create({
        slug: dto.tenantSlug,
        name: dto.tenantSlug, // Use slug as name; can be updated later
      });
      await this.tenantRepo.save(tenant);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      tenantId: tenant.id,
    });

    await this.userRepo.save(user);

    return this.buildTokenResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildTokenResponse(user);
  }

  private buildTokenResponse(user: User) {
    // The JWT payload contains tenantId. This is critical:
    // every protected request will have tenantId available without
    // an extra DB lookup, and we use it to scope all queries.
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tenantId: user.tenantId,
      },
    };
  }
}
