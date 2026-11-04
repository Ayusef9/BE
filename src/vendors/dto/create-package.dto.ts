import { Type } from 'class-transformer';
import {
  ArrayNotEmpty, ArrayUnique, IsArray, IsBoolean, IsInt, IsNumber,
  IsOptional, IsString, IsUUID, MaxLength, Min,
} from 'class-validator';

export class CreatePackageDto {
  @IsString({ message: "Nama harus berupa teks" })
  @MaxLength(150150, { message: "Nama maksimal 150 karakter" })
  readonly name: string;

  @IsOptional()
  @IsString({ message: "Deskripsi harus berupa teks" })
  readonly description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Harga harus berupa angka" })
  @Min(0, { message: "Harga minimal 0" })
  readonly price: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Jumlah tamu minimal harus berupa angka bulat" })
  @Min(1, { message: "Jumlah tamu minimal minimal 1" })
  readonly minGuests?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Jumlah tamu maksimal harus berupa angka bulat" })
  @Min(1, { message: "Jumlah tamu maksimal minimal 1" })
  readonly maxGuests?: number;

  @IsOptional()
  @IsString({ message: "Konsep harus berupa teks" })
  @MaxLength(100, { message: "Konsep maksimal 100 karakter" })
  readonly concept?: string;

  @IsOptional()
  @IsBoolean({ message: "Status aktif harus berupa nilai boolean" })
  readonly isActive?: boolean;

  /** Daftar service_items milik vendor yang masuk paket (tabel package_items) */
  @IsArray({ message: "Daftar ID layanan harus berupa array" })
  @ArrayNotEmpty({ message: "Daftar ID layanan tidak boleh berupa array kosong" })
  @ArrayUnique({ message: "Daftar ID layanan tidak boleh memiliki data duplikat" })
  @IsUUID('all', { each: true , message: 'Daftar ID layanan harus berupa UUID yang valid'})
  readonly serviceItemIds: string[];
}
