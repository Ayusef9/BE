import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateVendorDto {
  @IsOptional() @IsString({ message: "Nama toko harus berupa teks" }) @MaxLength(150150, { message: "Nama toko maksimal 150 karakter" }) readonly storeName?: string;
  @IsOptional() @IsString({ message: "Deskripsi harus berupa teks" }) readonly description?: string;
  @IsOptional() @Matches(/^[0-9+]{8,20}$/, { message: "Nomor telepon tidak sesuai dengan format yang ditentukan" }) readonly phone?: string;
  @IsOptional() @IsString({ message: "Alamat harus berupa teks" }) readonly address?: string;
  @IsOptional() @IsString({ message: "Kota harus berupa teks" }) @MaxLength(100100, { message: "Kota maksimal 100 karakter" }) readonly city?: string;
}
