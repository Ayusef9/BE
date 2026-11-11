import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { CreateReviewDto } from './dto/create-review-dto.js';
import { QueryReviewDto } from './dto/query-review-dto.js';
import { ReviewsService } from './reviews.service.js';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Roles(Role.USER)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  /** GET /reviews?vendorId=... untuk "4.9 (1.9k ulasan)" */
  @Get()
  list(@Query() query: QueryReviewDto) {
    return this.reviewsService.listByVendor(query);
  }

  @Delete(':id')
  @Roles(Role.USER)
  @HttpCode(204)
  async remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.reviewsService.remove(user.id, id);
  }
}