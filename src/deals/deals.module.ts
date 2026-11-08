// deals/deals.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../chat/entities/conversation.entity.js';
import { PlanNeed } from '../plans/entities/plan-need.entity.js';
import { PlansModule } from '../plans/plans.module.js';
import { Package } from '../vendors/entities/package.entity.js';
import { VendorsModule } from '../vendors/vendors.module.js';
import { DealsController } from './deals.controller.js';
import { DealsService } from './deals.service.js';
import { Deal } from './entities/deal.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Deal, Conversation, PlanNeed, Package]), PlansModule, VendorsModule],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}