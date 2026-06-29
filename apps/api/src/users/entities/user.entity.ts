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
import { Exclude } from 'class-transformer';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Todo } from '../../todos/entities/todo.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  // Password is excluded from all serialized responses via ClassSerializerInterceptor
  @Exclude()
  @Column()
  password: string;

  // Every user belongs to exactly one tenant (org).
  // If you later need users in multiple tenants, you'd add a join table.
  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @OneToMany(() => Todo, (todo) => todo.assignee)
  assignedTodos: Todo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
