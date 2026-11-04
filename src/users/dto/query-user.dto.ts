import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Role } from '../../common/enums/index.js';

export class QueryUserDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(Role, { message: "Peran memiliki nilai yang tidak valid" })
  readonly role?: Role;

  @IsOptional()
  @IsString({ message: "Pencarian harus berupa teks" })
  readonly search?: string;
}
