import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { UserTenant } from './user-tenant.entity';

/**
 * A Tenant represents an organization (e.g. "Acme Corp").
 * All data (boards, todos) is scoped to a tenant.
 * Users from Tenant A can NEVER access data from Tenant B unless
 * they also have a membership row in that tenant.
 */
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserTenant, (membership) => membership.tenant)
  memberships: UserTenant[];

  @OneToMany(() => Board, (board) => board.tenant)
  boards: Board[];
}
