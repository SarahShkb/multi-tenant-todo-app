import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepo: Repository<Board>,
  ) {}

  // Always pass tenantId from the JWT — never from the request body.
  // This prevents a user from accessing boards of another tenant.

  findAll(tenantId: string): Promise<Board[]> {
    return this.boardRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Board> {
    const board = await this.boardRepo.findOne({
      where: { id, tenantId }, // <-- tenantId guard on every single query
    });

    if (!board) {
      // Return 404 instead of 403 to avoid leaking that the board exists
      throw new NotFoundException(`Board not found`);
    }

    return board;
  }

  create(dto: CreateBoardDto, tenantId: string): Promise<Board> {
    const board = this.boardRepo.create({ ...dto, tenantId });
    return this.boardRepo.save(board);
  }

  async update(
    id: string,
    dto: UpdateBoardDto,
    tenantId: string,
  ): Promise<Board> {
    const board = await this.findOne(id, tenantId);
    Object.assign(board, dto);
    return this.boardRepo.save(board);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const board = await this.findOne(id, tenantId);
    await this.boardRepo.remove(board);
  }
}
