import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { CreateServiceItemDto } from './dto/create-service-item.dto.js';
import { QueryServiceItemDto } from './dto/query-service-item.dto.js';
import { UpdateServiceItemDto } from './dto/update-service-item.dto.js';
import { ServiceItemsService } from './service-items.service.js';

@ApiTags('vendor-service-items')
@ApiBearerAuth()
@Roles(Role.VENDOR)
@Controller('vendors/me/service-items')
export class ServiceItemsController {
  constructor(private readonly service: ServiceItemsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: QueryServiceItemDto) {
    return this.service.list(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateServiceItemDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateServiceItemDto) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(user.id, id);
  }
}
