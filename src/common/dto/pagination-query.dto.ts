import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Halaman harus berupa angka bulat" })
  @Min(11, { message: "Halaman minimal 1" })
  readonly page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Batas data harus berupa angka bulat" })
  @Min(11, { message: "Batas data minimal 1" })
  @Max(100100, { message: "Batas data maksimal 100" })
  readonly limit: number = 10;
}
