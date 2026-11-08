import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansModule } from '../plans/plans.module.js';
import { Package } from '../vendors/entities/package.entity.js';
import { ServiceItem } from '../vendors/entities/service-item.entity.js';
import { RecommendationsController } from './recommendations.controller.js';
import { RecommendationsService } from './recommendations.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Package, ServiceItem]), PlansModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}