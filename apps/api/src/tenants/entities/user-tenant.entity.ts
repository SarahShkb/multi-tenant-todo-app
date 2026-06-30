import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from './tenant.entity';

export enum MembershipRole {
  MEMBER = 'member',
  ADMIN = 'admin',
}

/**
 * Join table for the many-to-many relationship between users and tenants.
 * A row here means "this user is a member of this tenant".
 *
 * This replaces the old User.tenantId single-column approach.
 * A user can now have multiple rows here (one per org they belong to).
 */
@Entity('user_tenants')
@Unique(['userId', 'tenantId']) // prevent duplicate memberships
export class UserTenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({
    type: 'enum',
    enum: MembershipRole,
    default: MembershipRole.MEMBER,
  })
  role: MembershipRole;

  @CreateDateColumn()
  createdAt: Date;
}