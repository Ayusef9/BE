// scheduler/scheduler.controller.ts
import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { QueryScheduleDto } from './dto/query-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { SchedulerService } from './scheduler.service.js';

@ApiTags('schedules')
@ApiBearerAuth()
@Controller('schedules')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post()
  @Roles(Role.USER)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateScheduleDto) {
    return this.schedulerService.create(user.id, dto);
  }

  @Get()
  @Roles(Role.USER, Role.VENDOR)
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryScheduleDto) {
    return this.schedulerService.findAll(user, query);
  }

  @Patch(':id')
  @Roles(Role.USER)
  update(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateScheduleDto) {
    return this.schedulerService.update(user.id, id, dto);
  }

  @Delete(':id')
  @Roles(Role.USER)
  @HttpCode(204)
  async remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.schedulerService.remove(user.id, id);
  }
}