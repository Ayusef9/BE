import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { VerificationStatus } from '../../common/enums/index.js';


export class QueryVendorDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(VerificationStatus, { message: "Status memiliki nilai yang tidak valid" })
  readonly status?: VerificationStatus;

  @IsOptional()
  @IsString({ message: "Pencarian harus berupa teks" })
  readonly search?: string;
}
