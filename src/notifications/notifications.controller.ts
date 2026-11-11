import { Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { NotificationsService } from './notifications.service.js';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto) {
    return this.notificationsService.list(user.id, query);
  }

  /** Untuk titik merah di ikon lonceng */
  @Get('unread-count')
  unreadCount(@CurrentUser() user: AuthUser) {
    return this.notificationsService.unreadCount(user.id);
  }

  @Patch('read-all')
  @HttpCode(204)
  async markAllRead(@CurrentUser() user: AuthUser) {
    await this.notificationsService.markAllRead(user.id);
  }

  @Patch(':id/read')
  @HttpCode(204)
  async markRead(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.notificationsService.markRead(user.id, id);
  }
}