import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansModule } from '../plans/plans.module.js';
import { Schedule } from '../scheduler/entities/schedule.entity.js';
import { Task } from '../tasks/entities/task-entity.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Schedule]), PlansModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}