import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users — list all users in the current tenant
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.usersService.findAll(user.tenantId);
  }

  // GET /users/me — convenience route for "my own profile"
  // Defined BEFORE /users/:id so "me" isn't treated as an id.
  @Get('me')
  findMe(@CurrentUser() user: User) {
    return user;
  }

  // GET /users/:id
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.usersService.findOne(id, user.tenantId);
  }

  // PATCH /users/me — update your own profile
  @Patch('me')
  updateMe(@Body() dto: UpdateUserDto, @CurrentUser() user: User) {
    return this.usersService.update(user.id, dto, user.tenantId);
  }

  // PATCH /users/:id — update any user in your tenant
  // NOTE: in a real app you'd likely restrict this to admins only
  // (e.g. an @Roles('admin') guard). For this assignment's scope,
  // any authenticated tenant member can edit any other member.
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.update(id, dto, user.tenantId);
  }

  // DELETE /users/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.usersService.remove(id, user.tenantId);
  }
}
