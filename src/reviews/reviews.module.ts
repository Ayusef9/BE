// reviews/reviews.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from '../deals/entities/deal.entity.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { PlansModule } from '../plans/plans.module.js';
import { Review } from './entities/review-entity.js';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Deal]), PlansModule, NotificationsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}