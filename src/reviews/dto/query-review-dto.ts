import { IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class QueryReviewDto extends PaginationQueryDto {
  @IsUUID('all', { message: 'ID vendor harus berupa UUID yang valid' })
  readonly vendorId: string;
}