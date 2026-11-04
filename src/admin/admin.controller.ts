import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { QueryUserDto } from '../users/dto/query-user.dto.js';
import { SetActiveDto } from '../users/dto/set-active.dto.js';
import { UsersService } from '../users/users.service.js';
import { QueryVendorDto } from '../vendors/dto/query-vendor.dto.js';
import { VerifyVendorDto } from '../vendors/dto/verify-vendor.dto.js';
import { VendorsService } from '../vendors/vendors.service.js';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly vendorsService: VendorsService,
    private readonly usersService: UsersService,
  ) {}

  // ---- verifikasi vendor (halaman utama dashboard admin)
  @Get('vendors')
  listVendors(@Query() query: QueryVendorDto) {
    return this.vendorsService.findAll(query);
  }

  @Get('vendors/:id')
  getVendor(@Param('id', ParseUUIDPipe) id: string) {
    return this.vendorsService.findOne(id);
  }

  @Patch('vendors/:id/verify')
  verifyVendor(
    @CurrentUser() admin: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyVendorDto,
  ) {
    return this.vendorsService.verify(id, admin.id, dto);
  }

  // ---- kelola user
  @Get('users')
  listUsers(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Patch('users/:id/active')
  setUserActive(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetActiveDto) {
    return this.usersService.setActive(id, dto.isActive);
  }

  // ---- statistik
  @Get('stats')
  async stats() {
    const [usersByRole, vendorsByStatus] = await Promise.all([
      this.usersService.countByRole(),
      this.vendorsService.countByStatus(),
    ]);
    return { usersByRole, vendorsByStatus };
  }
}
