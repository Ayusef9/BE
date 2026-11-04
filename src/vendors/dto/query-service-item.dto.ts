import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class QueryServiceItemDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID("all", { message: "ID kategori harus berupa UUID yang valid" })
  readonly categoryId?: string;
}
