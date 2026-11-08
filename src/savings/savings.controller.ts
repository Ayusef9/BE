// savings/savings.controller.ts
import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { CreateContributionDto } from './dto/create-contribution.dto.js';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto.js';
import { CreateSavingsNoteDto } from './dto/create-savings-note.dto.js';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto.js';
import { SavingsService } from './savings.service.js';

@ApiTags('savings')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('savings/goals')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Post()
  createGoal(@CurrentUser() user: AuthUser, @Body() dto: CreateSavingsGoalDto) {
    return this.savingsService.createGoal(user.id, dto);
  }

  @Get()
  listGoals(@CurrentUser() user: AuthUser, @Query('planId', ParseUUIDPipe) planId: string) {
    return this.savingsService.listGoals(user.id, planId);
  }

  @Get(':id')
  getGoal(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.savingsService.getGoal(user.id, id);
  }

  @Patch(':id')
  updateGoal(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSavingsGoalDto,
  ) {
    return this.savingsService.updateGoal(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async removeGoal(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.savingsService.removeGoal(user.id, id);
  }

  @Post(':id/contributions')
  addContribution(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateContributionDto,
  ) {
    return this.savingsService.addContribution(user.id, id, dto);
  }

  @Delete(':id/contributions/:contributionId')
  @HttpCode(204)
  async removeContribution(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contributionId', ParseUUIDPipe) contributionId: string,
  ) {
    await this.savingsService.removeContribution(user.id, id, contributionId);
  }

  @Post(':id/notes')
  addNote(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSavingsNoteDto,
  ) {
    return this.savingsService.addNote(user.id, id, dto);
  }
}