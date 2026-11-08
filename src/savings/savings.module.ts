// savings/savings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansModule } from '../plans/plans.module.js';
import { SavingsContribution } from './entities/savings-contribution.entity.js';
import { SavingsGoal } from './entities/savings-goal.entity.js';
import { SavingsNote } from './entities/savings-note.entity.js';
import { SavingsController } from './savings.controller.js';
import { SavingsService } from './savings.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([SavingsGoal, SavingsContribution, SavingsNote]), PlansModule],
  controllers: [SavingsController],
  providers: [SavingsService],
})
export class SavingsModule {}