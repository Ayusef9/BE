import { Controller, Get, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { DashboardService } from './dashboard.service.js';
import { QueryCalendarDto, QueryDayDto } from './dto/query-calendar.dto.js';

@ApiTags('dashboard')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary(@CurrentUser() user: AuthUser, @Query('planId', ParseUUIDPipe) planId: string) {
    return this.dashboardService.summary(user.id, planId);
  }

  @Get('calendar')
  calendar(@CurrentUser() user: AuthUser, @Query() query: QueryCalendarDto) {
    return this.dashboardService.calendar(user.id, query);
  }

  @Get('calendar/day')
  day(@CurrentUser() user: AuthUser, @Query() query: QueryDayDto) {
    return this.dashboardService.day(user.id, query);
  }
}