import { IsBoolean, IsOptional } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto.js';

export class UpdateScheduleDto extends PartialType(OmitType(CreateScheduleDto, ['planId'] as const)) {
  @IsOptional()
  @IsBoolean({ message: "Status selesai harus berupa nilai boolean" })
  readonly isDone?: boolean;
}
