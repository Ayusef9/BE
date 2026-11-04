import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ScheduleType } from '../../common/enums/index.js';

/** Jadwal manual buatan user. Jadwal auto/deal dibuat oleh sistem lewat event. */
export class CreateScheduleDto {
  @IsUUID("all", { message: "ID rencana harus berupa UUID yang valid" })
  readonly planId: string;

  @IsString({ message: "Judul harus berupa teks" })
  @MaxLength(150150, { message: "Judul maksimal 150 karakter" })
  readonly title: string;

  @IsOptional()
  @IsString({ message: "Deskripsi harus berupa teks" })
  readonly description?: string;

  @IsOptional()
  @IsEnum(ScheduleType, { message: "Jenis memiliki nilai yang tidak valid" })
  readonly type?: ScheduleType;

  @IsDateString({}, { message: "Waktu mulai harus berupa tanggal yang valid" })
  readonly startAt: string;

  @IsOptional()
  @IsDateString({}, { message: "Waktu selesai harus berupa tanggal yang valid" })
  readonly endAt?: string;

  @IsOptional()
  @IsDateString({}, { message: "Waktu pengingat harus berupa tanggal yang valid" })
  readonly remindAt?: string;
}
