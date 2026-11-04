import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateServiceItemDto {
  @IsUUID("all", { message: "ID kategori harus berupa UUID yang valid" })
  readonly categoryId: string;

  @IsString({ message: "Nama harus berupa teks" })
  @MaxLength(150, { message: "Nama maksimal 150 karakter" })
  readonly name: string;

  @IsOptional()
  @IsString({ message: "Deskripsi harus berupa teks" })
  readonly description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Harga harus berupa angka" })
  @Min(0, { message: "Harga minimal 0" })
  readonly price: number;

  @IsOptional()
  @IsString({ message: "Satuan harus berupa teks" })
  @MaxLength(30, { message: "Satuan maksimal 30 karakter" })
  readonly unit?: string;

  @IsOptional()
  @IsBoolean({ message: "Status aktif harus berupa nilai boolean" })
  readonly isActive?: boolean;
}
