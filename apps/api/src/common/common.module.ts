import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTenant } from '../tenants/entities/user-tenant.entity';
import { RolesGuard } from './guards/roles.guard';

// Import this module anywhere you need @UseGuards(RolesGuard).
// It handles the UserTenant repository injection that RolesGuard needs.
@Module({
  imports: [TypeOrmModule.forFeature([UserTenant])],
  providers: [RolesGuard],
  exports: [RolesGuard],
})
export class CommonModule {}
