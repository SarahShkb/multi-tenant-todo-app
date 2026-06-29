import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosService } from './todo.service';
import { TodosController } from './todo.controller';
import { TodosGateway } from './todo.gateway';
import { Todo } from './entities/todo.entity';
import { BoardsModule } from '../boards/board.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    BoardsModule, // For board ownership checks
    AuthModule, // For JwtService in the gateway
  ],
  controllers: [TodosController],
  providers: [TodosService, TodosGateway],
})
export class TodosModule {}
