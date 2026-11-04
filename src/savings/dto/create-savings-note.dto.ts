import { IsString, MinLength } from 'class-validator';

export class CreateSavingsNoteDto {
  @IsString({ message: "Konten harus berupa teks" })
  @MinLength(1, { message: "Konten minimal 1 karakter" })
  readonly content: string;
}
