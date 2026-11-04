import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  /** Dipanggil aplikasi mobile setelah login untuk push notification. */
  @Post('me/device-tokens')
  registerDevice(@CurrentUser() user: AuthUser, @Body() dto: RegisterDeviceTokenDto) {
    return this.usersService.registerDevice(user.id, dto);
  }

  @Delete('me/device-tokens/:fcmToken')
  @HttpCode(204)
  async removeDevice(@CurrentUser() user: AuthUser, @Param('fcmToken') fcmToken: string) {
    await this.usersService.removeDevice(user.id, fcmToken);
  }
}
