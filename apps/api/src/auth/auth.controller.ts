import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, SwitchTenantDto, SelectTenantDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/signup
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  // POST /auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // POST /auth/switch-tenant — requires an existing valid token.
  // Returns a NEW token scoped to the requested tenant.
  @UseGuards(JwtAuthGuard)
  @Post('switch-tenant')
  @HttpCode(HttpStatus.OK)
  switchTenant(
    @Body() dto: SwitchTenantDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.authService.switchTenant(user.id, dto);
  }

  @Post("select-tenant")
  @HttpCode(HttpStatus.OK)
  selectTenant(@Body() dto: SelectTenantDto) {
    return this.authService.selectTenant(dto);
  }
}
