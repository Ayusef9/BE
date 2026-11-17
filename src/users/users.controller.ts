import {Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { imageUpload } from '../common/utils/upload.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
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
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', imageUpload('avatars')))
  uploadAvatar(@CurrentUser() user: AuthUser, @UploadedFile() file?: Express.Multer.File) {
    return this.usersService.setAvatar(user.id, file);
  }

  /** Menu "Keamanan akun" */
  @Patch('me/password')
  @HttpCode(204)
  async changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(user.id, dto);
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