import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/** Semua isian wizard opsional: boleh dilewati dan diisi bertahap. */
export class CreatePlanDto {
  @IsString({ message: "Judul harus berupa teks" })
  @MaxLength(150, { message: "Judul maksimal 150 karakter" })
  readonly title: string;

  @IsOptional()
  @IsDateString({}, { message: "Tanggal pernikahan harus berupa tanggal yang valid" })
  readonly weddingDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Total anggaran harus berupa angka" })
  @Min(0, { message: "Total anggaran minimal 0" })
  readonly totalBudget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Jumlah tamu harus berupa angka bulat" })
  @Min(1, { message: "Jumlah tamu minimal 1" })
  readonly guestCount?: number;

  @IsOptional()
  @IsString({ message: "Venue Type harus berupa teks" })
  @MaxLength(50, { message: "Venue Type maksimal 50 karakter" })
  readonly venueType?: string;

  @IsOptional()
  @IsString({ message: "Konsep harus berupa teks" })
  @MaxLength(100, { message: "Konsep maksimal 100 karakter" })
  readonly concept?: string;
}
