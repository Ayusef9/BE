import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from '../deals/entities/deal.entity.js';
import { UsersModule } from '../users/users.module.js';
import { ServiceCategory } from '../vendors/entities/service-category.entity.js';
import { PlanMember } from './entities/plan-member.entity.js';
import { PlanNeed } from './entities/plan-need.entity.js';
import { WeddingPlan } from './entities/wedding-plan.entity.js';
import { PlansController } from './plans.controller.js';
import { PlansService } from './plans.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([WeddingPlan, PlanMember, PlanNeed, ServiceCategory, Deal]), UsersModule],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService], 
})
export class PlansModule {}