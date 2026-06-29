import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Board } from '../../boards/entities/board.entity';

/**
 * A Tenant represents an organization (e.g. "Acme Corp").
 * All data (boards, todos) is scoped to a tenant.
 * Users from Tenant A can NEVER see data from Tenant B.
 *
 * This is "row-level" multi-tenancy: every table that holds
 * business data has a tenantId foreign key, and every query
 * filters by that column.
 */
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  // slug is used in invite links, e.g. /join/acme-corp
  @Column({ unique: true })
  slug: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Board, (board) => board.tenant)
  boards: Board[];
}
