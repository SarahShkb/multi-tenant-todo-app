import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserTenant } from '../tenants/entities/user-tenant.entity';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(UserTenant)
    private readonly membershipRepo: Repository<UserTenant>,
  ) {}

  // List all users who have a membership in the given tenant.
  // tenantId always comes from the caller's active session, never
  // from client input — so this can't be used to enumerate other orgs.
  async findAll(tenantId: string): Promise<User[]> {
    const memberships = await this.membershipRepo.find({
      where: { tenantId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return memberships.map((m) => m.user);
  }

  async findOne(id: string, tenantId: string): Promise<User> {
    const membership = await this.membershipRepo.findOne({
      where: { userId: id, tenantId },
      relations: ['user'],
    });

    if (!membership) {
      // 404 rather than 403 — don't reveal that a user exists
      // in a tenant the caller isn't part of.
      throw new NotFoundException('User not found');
    }

    return membership.user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    tenantId: string,
  ): Promise<User> {
    // findOne already enforces that `id` is a member of `tenantId`
    const user = await this.findOne(id, tenantId);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
      user.email = dto.email;
    }

    if (dto.name) {
      user.name = dto.name;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 12);
    }

    return this.userRepo.save(user);
  }

  // Removes the user's MEMBERSHIP in this tenant, not the user account
  // itself — since the same user may belong to other tenants too.
  // If this was their last membership, we also delete the user account.
  async remove(id: string, tenantId: string): Promise<void> {
    const membership = await this.membershipRepo.findOne({
      where: { userId: id, tenantId },
    });

    if (!membership) {
      throw new NotFoundException('User not found');
    }

    await this.membershipRepo.remove(membership);

    const remaining = await this.membershipRepo.count({
      where: { userId: id },
    });

    if (remaining === 0) {
      await this.userRepo.delete(id);
    }
  }
}
