import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { RegisterVendorDto } from './dto/register-vendor.dto.js';
import { UpdateVendorDto } from './dto/update-vendor.dto.js';
import { VendorsService } from './vendors.service.js';

@ApiTags('vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  /** Pintasan pendaftaran mitra (seperti daftar toko di marketplace). Wajib diverifikasi admin. */
  @Public()
  @Post('register')
  register(@Body() dto: RegisterVendorDto) {
    return this.vendorsService.register(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.vendorsService.findMine(user.id);
  }

  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateVendorDto) {
    return this.vendorsService.updateMine(user.id, dto);
  }
}
