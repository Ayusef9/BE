import { IsBoolean, IsOptional } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDocumentTaskDto } from './create-document-task.dto.js';

export class UpdateDocumentTaskDto extends PartialType(OmitType(CreateDocumentTaskDto, ['planId'] as const)) {
  @IsOptional()
  @IsBoolean({ message: "Status selesai harus berupa nilai boolean" })
  readonly isDone?: boolean;
}
