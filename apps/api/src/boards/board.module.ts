import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from './board.service';
import { BoardsController } from './board.controller';
import { Board } from './entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board])],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService], // TodosService needs this to verify board ownership
})
export class BoardsModule {}
