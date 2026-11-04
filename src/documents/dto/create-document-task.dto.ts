import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDocumentTaskDto {
  @IsUUID("all", { message: "ID rencana harus berupa UUID yang valid" })
  readonly planId: string;

  @IsString({ message: "Judul harus berupa teks" })
  @MaxLength(150, { message: "Judul maksimal 150 karakter" })
  readonly title: string;

  @IsOptional()
  @IsString({ message: "Deskripsi harus berupa teks" })
  readonly description?: string;

  @IsOptional()
  @IsDateString({}, { message: "Due Date harus berupa tanggal yang valid" })
  readonly dueDate?: string;
}
