import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { DealStatus } from '../../common/enums/index.js';

export class QueryDealDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(DealStatus, { message: "Status memiliki nilai yang tidak valid" })
  readonly status?: DealStatus;

  @IsOptional()
  @IsUUID("all", { message: "ID rencana harus berupa UUID yang valid" })
  readonly planId?: string;
}
