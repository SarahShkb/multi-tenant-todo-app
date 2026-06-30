import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTenant, MembershipRole } from './entities/user-tenant.entity';
import { User } from '../users/entities/user.entity';
import { AddMemberDto } from './dto/tenant.dto';
import { AuthenticatedUser } from '../common/strategies/jwt.strategy';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(UserTenant)
    private readonly membershipRepo: Repository<UserTenant>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // List all members of the current tenant
  async getMembers(tenantId: string) {
    const memberships = await this.membershipRepo.find({
      where: { tenantId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return memberships.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      joinedAt: m.createdAt,
    }));
  }

  // Admin adds a user by email to their tenant.
  // The target user must already have an account — this is not an invite
  // system, just controlled access grant.
  async addMember(tenantId: string, dto: AddMemberDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('No account found with that email address');
    }

    const existing = await this.membershipRepo.findOne({
      where: { userId: user.id, tenantId },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this tenant');
    }

    const membership = this.membershipRepo.create({
      userId: user.id,
      tenantId,
      role: dto.role ?? MembershipRole.MEMBER,
    });

    await this.membershipRepo.save(membership);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: membership.role,
      joinedAt: membership.createdAt,
    };
  }

  // Admin removes a user from their tenant.
  // Prevents admin from removing themselves — someone else must demote
  // them first, to avoid orgs being left with no admin.
  async removeMember(
    targetUserId: string,
    tenantId: string,
    requestingUser: AuthenticatedUser,
  ) {
    if (targetUserId === requestingUser.id) {
      throw new BadRequestException(
        'You cannot remove yourself from the tenant. Transfer admin rights first.',
      );
    }

    const membership = await this.membershipRepo.findOne({
      where: { userId: targetUserId, tenantId },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this tenant');
    }

    await this.membershipRepo.remove(membership);
  }
}
