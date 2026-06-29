import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';
import { BoardsService } from '../boards/board.service';
import { TodosGateway } from './todo.gateway';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepo: Repository<Todo>,

    private readonly boardsService: BoardsService,

    // We inject the gateway so the service can push real-time events
    // after each mutation. The gateway handles socket room logic.
    private readonly todosGateway: TodosGateway,
  ) {}

  async findAll(boardId: string, tenantId: string): Promise<Todo[]> {
    // First verify this board belongs to the tenant (throws 404 if not)
    await this.boardsService.findOne(boardId, tenantId);

    return this.todoRepo.find({
      where: { boardId, tenantId },
      relations: ['assignee'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Todo> {
    const todo = await this.todoRepo.findOne({
      where: { id, tenantId },
      relations: ['assignee'],
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async create(
    boardId: string,
    dto: CreateTodoDto,
    tenantId: string,
  ): Promise<Todo> {
    // Verify board ownership before creating
    await this.boardsService.findOne(boardId, tenantId);

    const todo = this.todoRepo.create({ ...dto, boardId, tenantId });
    const saved = await this.todoRepo.save(todo);

    // Emit real-time event to all users watching this board
    this.todosGateway.emitToBoardForTenant(
      tenantId,
      boardId,
      'todo:created',
      saved,
    );

    return saved;
  }

  async update(
    id: string,
    dto: UpdateTodoDto,
    tenantId: string,
  ): Promise<Todo> {
    const todo = await this.findOne(id, tenantId);
    Object.assign(todo, dto);
    const saved = await this.todoRepo.save(todo);

    this.todosGateway.emitToBoardForTenant(
      tenantId,
      todo.boardId,
      'todo:updated',
      saved,
    );

    return saved;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const todo = await this.findOne(id, tenantId);
    await this.todoRepo.remove(todo);

    // Emit with the id since the entity is now deleted
    this.todosGateway.emitToBoardForTenant(
      tenantId,
      todo.boardId,
      'todo:deleted',
      { id },
    );
  }
}
