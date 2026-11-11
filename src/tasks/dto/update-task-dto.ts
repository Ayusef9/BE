import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskPriority } from '../../common/enums/index.js';

export class UpdateTaskDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Nama tugas tidak boleh kosong' })
  @IsString({ message: 'Nama tugas harus berupa teks' })
  @MaxLength(150, { message: 'Nama tugas maksimal 150 karakter' })
  readonly title?: string;

  @IsOptional()
  @IsString({ message: 'Kategori harus berupa teks' })
  @MaxLength(50, { message: 'Kategori maksimal 50 karakter' })
  readonly category?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Tenggat harus berupa tanggal yang valid' })
  readonly dueDate?: string;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Prioritas memiliki nilai yang tidak valid' })
  readonly priority?: TaskPriority;

  @IsOptional()
  @IsBoolean({ message: 'Status selesai harus berupa nilai boolean' })
  readonly isDone?: boolean;
}