import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSavingsGoalDto } from './create-savings-goal.dto.js';

export class UpdateSavingsGoalDto extends PartialType(OmitType(CreateSavingsGoalDto, ['planId'] as const)) {}
