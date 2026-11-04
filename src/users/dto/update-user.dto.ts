import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "Nama harus berupa teks" })
  @MinLength(2, { message: "Nama minimal 2 karakter" })
  @MaxLength(150, { message: "Nama maksimal 150 karakter" })
  readonly name?: string;

  @IsOptional()
  @Matches(/^[0-9+]{8,20}$/, { message: 'Nomor telepon tidak sesuai dengan format yang ditentukan' })
  readonly phone?: string;
}
