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
import { BoardsService } from './board.service';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard) // All routes here require a valid JWT
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // GET /boards
  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    // tenantId comes from the verified JWT, not from the URL or body.
    // This is the core of tenant isolation.
    return this.boardsService.findAll(user.tenantId);
  }

  // GET /boards/:id
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.boardsService.findOne(id, user.tenantId);
  }

  // POST /boards
  @Post()
  create(@Body() dto: CreateBoardDto, @CurrentUser() user: AuthenticatedUser) {
    return this.boardsService.create(dto, user.tenantId);
  }

  // PATCH /boards/:id
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.boardsService.update(id, dto, user.tenantId);
  }

  // DELETE /boards/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.boardsService.remove(id, user.tenantId);
  }
}
