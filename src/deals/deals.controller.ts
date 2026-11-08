// deals/deals.controller.ts
import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { DealsService } from './deals.service.js';
import { CreateDealDto } from './dto/create-deal.dto.js';
import { QueryDealDto } from './dto/query-deal.dto.js';
import { RespondDealDto } from './dto/respond-deal.dto.js';

@ApiTags('deals')
@ApiBearerAuth()
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @Roles(Role.USER)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDealDto) {
    return this.dealsService.create(user.id, dto);
  }

  @Get()
  @Roles(Role.USER, Role.VENDOR)
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryDealDto) {
    return this.dealsService.findAll(user, query);
  }

  @Get(':id')
  @Roles(Role.USER, Role.VENDOR)
  findOne(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.dealsService.findOne(user, id);
  }

  @Patch(':id/respond')
  @Roles(Role.VENDOR)
  respond(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: RespondDealDto) {
    return this.dealsService.respond(user.id, id, dto);
  }

  @Patch(':id/cancel')
  @Roles(Role.USER)
  cancel(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.dealsService.cancel(user.id, id);
  }
}