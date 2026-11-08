// scheduler/scheduler.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansModule } from '../plans/plans.module.js';
import { VendorsModule } from '../vendors/vendors.module.js';
import { Schedule } from './entities/schedule.entity.js';
import { SchedulerController } from './scheduler.controller.js';
import { SchedulerService } from './scheduler.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule]), PlansModule, VendorsModule],
  controllers: [SchedulerController],
  providers: [SchedulerService],
})
export class SchedulerModule {}