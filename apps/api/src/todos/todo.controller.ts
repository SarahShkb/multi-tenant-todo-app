import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TodosService } from './todo.service';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/strategies/jwt.strategy';

// Routes are nested under boards: /boards/:boardId/todos
@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  // GET /boards/:boardId/todos
  @Get()
  findAll(
    @Param('boardId') boardId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.todosService.findAll(boardId, user.tenantId);
  }

  // GET /boards/:boardId/todos/:id
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.todosService.findOne(id, user.tenantId);
  }

  // POST /boards/:boardId/todos
  @Post()
  create(
    @Param('boardId') boardId: string,
    @Body() dto: CreateTodoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.todosService.create(boardId, dto, user.tenantId);
  }

  // PATCH /boards/:boardId/todos/:id
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTodoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.todosService.update(id, dto, user.tenantId);
  }

  // DELETE /boards/:boardId/todos/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.todosService.remove(id, user.tenantId);
  }
}
