import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { User } from '../../users/entities/user.entity';

export enum TodoStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
}

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TodoStatus,
    default: TodoStatus.TODO,
  })
  status: TodoStatus;

  // tenantId is denormalized here (it's also on board) for fast,
  // safe filtering — we never do a todo query without it.
  @Column()
  tenantId: string;

  @Column()
  boardId: string;

  @ManyToOne(() => Board, (board) => board.todos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({ nullable: true })
  assigneeId: string;

  @ManyToOne(() => User, (user) => user.assignedTodos, { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
