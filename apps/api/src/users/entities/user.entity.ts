import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Todo } from '../../todos/entities/todo.entity';
import { UserTenant } from '../../tenants/entities/user-tenant.entity';

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

  // A user can belong to multiple tenants now. The old single
  // `tenantId` column is gone — membership lives in UserTenant.
  @OneToMany(() => UserTenant, (membership) => membership.user)
  memberships: UserTenant[];

  @OneToMany(() => Todo, (todo) => todo.assignee)
  assignedTodos: Todo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
