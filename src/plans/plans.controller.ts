import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { AddPlanMemberDto } from './dto/add-plan-member.dto.js';
import { CreatePlanDto } from './dto/create-plan.dto.js';
import { CreatePlanNeedDto } from './dto/create-plan-need.dto.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';
import { UpdatePlanNeedDto } from './dto/update-plan-need.dto.js';
import { PlansService } from './plans.service.js';

@ApiTags('plans')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePlanDto) {
    return this.plansService.create(user.id, dto);
  }

  @Get()
  findMine(@CurrentUser() user: AuthUser) {
    return this.plansService.findMine(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.findOne(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.plansService.remove(user.id, id);
  }

  @Post(':id/members')
  addMember(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AddPlanMemberDto) {
    return this.plansService.addMember(user.id, id, dto);
  }

  @Get(':id/budget')
  budget(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.getBudgetSummary(user.id, id);
  }

  @Get(':id/timeline')
  timeline(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.getTimeline(user.id, id);
  }

  @Get(':id/needs')
  listNeeds(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.listNeeds(user.id, id);
  }

  @Post(':id/needs')
  addNeed(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CreatePlanNeedDto) {
    return this.plansService.addNeed(user.id, id, dto);
  }

  @Patch(':id/needs/:needId')
  updateNeed(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('needId', ParseUUIDPipe) needId: string,
    @Body() dto: UpdatePlanNeedDto,
  ) {
    return this.plansService.updateNeed(user.id, id, needId, dto);
  }

  @Delete(':id/needs/:needId')
  @HttpCode(204)
  async removeNeed(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('needId', ParseUUIDPipe) needId: string,
  ) {
    await this.plansService.removeNeed(user.id, id, needId);
  }
}