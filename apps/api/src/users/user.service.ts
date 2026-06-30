import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // List all users in the CURRENT user's tenant only.
  findAll(tenantId: string): Promise<User[]> {
    return this.userRepo.find({
      where: { tenantId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id, tenantId }, // tenantId guard — same pattern as boards/todos
    });

    if (!user) {
      // 404 rather than 403, so we don't reveal that a user exists
      // in a different tenant.
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    tenantId: string,
  ): Promise<User> {
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

  async remove(id: string, tenantId: string): Promise<void> {
    const user = await this.findOne(id, tenantId);
    await this.userRepo.remove(user);
  }
}