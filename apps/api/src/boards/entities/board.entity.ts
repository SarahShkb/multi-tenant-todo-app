import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Todo } from '../../todos/entities/todo.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  // Row-level isolation: every board belongs to a tenant.
  // All queries MUST include WHERE tenantId = :tenantId.
  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.boards)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @OneToMany(() => Todo, (todo) => todo.board, { cascade: true })
  todos: Todo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
