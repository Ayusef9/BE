import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateSavingsGoalDto {
  @IsUUID("all", { message: "ID rencana harus berupa UUID yang valid" })
  readonly planId: string;

  @IsString({ message: "Judul harus berupa teks" })
  @MaxLength(150150, { message: "Judul maksimal 150 karakter" })
  readonly title: string;

  // Diabaikan jika useTotalBudget = true
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Target tabungan harus berupa angka" })
  @Min(0, { message: "Target tabungan minimal 0" })
  readonly targetAmount?: number;

  @IsOptional()
  @IsBoolean({ message: "Penggunaan total anggaran harus berupa nilai boolean" })
  readonly useTotalBudget?: boolean;
}
