import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { TaskPriority } from '../../common/enums/index.js';

export class CreateTaskDto {
  @IsUUID('all', { message: 'ID rencana harus berupa UUID yang valid' })
  readonly planId: string;

  @IsNotEmpty({ message: 'Nama tugas tidak boleh kosong' })
  @IsString({ message: 'Nama tugas harus berupa teks' })
  @MaxLength(150, { message: 'Nama tugas maksimal 150 karakter' })
  readonly title: string;

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
}