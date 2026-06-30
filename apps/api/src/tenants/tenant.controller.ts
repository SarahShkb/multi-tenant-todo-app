import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TenantsService } from './tenant.service';
import { AddMemberDto } from './dto/tenant.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MembershipRole } from './entities/user-tenant.entity';
import type { AuthenticatedUser } from '../common/strategies/jwt.strategy';

// ALL routes here require:
// 1. A valid JWT (JwtAuthGuard)
// 2. The user to be an admin in their active tenant (RolesGuard + @Roles)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // GET /tenants/members
  // Any tenant member can see who else is in their org
  @Get('members')
  getMembers(@CurrentUser() user: AuthenticatedUser) {
    return this.tenantsService.getMembers(user.tenantId);
  }

  // POST /tenants/members — admin only
  // Body: { email: string, role?: 'member' | 'admin' }
  @Post('members')
  @Roles(MembershipRole.ADMIN)
  addMember(@Body() dto: AddMemberDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tenantsService.addMember(user.tenantId, dto);
  }

  // DELETE /tenants/members/:userId — admin only
  @Delete('members/:userId')
  @Roles(MembershipRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tenantsService.removeMember(userId, user.tenantId, user);
  }
}
