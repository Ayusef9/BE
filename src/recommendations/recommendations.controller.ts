import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { QueryRecommendationDto } from './dto/query-recommendation.dto.js';
import { RecommendationsService } from './recommendations.service.js';

@ApiTags('recommendations')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  /** GET /recommendations?mode=package&planId=... atau ?mode=item&categoryId=... */
  @Get()
  search(@CurrentUser() user: AuthUser, @Query() query: QueryRecommendationDto) {
    return this.recommendationsService.search(user.id, query);
  }
}