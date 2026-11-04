import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { RecommendationMode } from '../../common/enums/index.js';

/**
 * GET /recommendations?mode=package&planId=...&maxPrice=...
 * Jika planId diisi, budget/tamu/konsep otomatis diambil dari rencana
 * dan dapat ditimpa oleh parameter di bawah ini.
 */
export class QueryRecommendationDto extends PaginationQueryDto {
  @IsEnum(RecommendationMode, { message: "Mode memiliki nilai yang tidak valid" })
  readonly mode: RecommendationMode;

  @IsOptional()
  @IsUUID("all", { message: "ID rencana harus berupa UUID yang valid" })
  readonly planId?: string;

  /** Mode per-item: kategori kebutuhan (katering saja, dekorasi saja, dst.) */
  @IsOptional()
  @IsUUID("all", { message: "ID kategori harus berupa UUID yang valid" })
  readonly categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Harga maksimal harus berupa angka" })
  @Min(0, { message: "Harga maksimal minimal 0" })
  readonly maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Jumlah tamu harus berupa angka bulat" })
  @Min(11, { message: "Jumlah tamu minimal 1" })
  readonly guestCount?: number;

  @IsOptional()
  @IsString({ message: "Konsep harus berupa teks" })
  readonly concept?: string;

  @IsOptional()
  @IsString({ message: "Kota harus berupa teks" })
  readonly city?: string;
}
