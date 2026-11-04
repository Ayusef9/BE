import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';


export class RegisterVendorDto {
  // --- data akun
  @IsString({ message: "Nama harus berupa teks" })
  @MinLength(2, { message: "Nama minimal 2 karakter" })
  @MaxLength(150, { message: "Nama maksimal 150 karakter" })
  readonly name: string;

  @IsEmail({}, { message: "Email harus berupa alamat email yang valid" })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  readonly email: string;

  @IsString({ message: "Password harus berupa teks" })
  @MinLength(8, { message: "Password minimal 8 karakter" })
  @MaxLength(64, { message: "Password maksimal 64 karakter" })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Password tidak sesuai dengan format yang ditentukan' })
  readonly password: string;

  // --- data toko
  @IsString({ message: "Nama toko harus berupa teks" })
  @MinLength(2, { message: "Nama toko minimal 2 karakter" })
  @MaxLength(150, { message: "Nama toko maksimal 150 karakter" })
  readonly storeName: string;

  @IsOptional()
  @IsString({ message: "Deskripsi harus berupa teks" })
  readonly description?: string;

  @Matches(/^[0-9+]{8,20}$/, { message: 'Nomor telepon tidak sesuai dengan format yang ditentukan' })
  readonly phone: string;

  @IsString({ message: "Alamat harus berupa teks" })
  readonly address: string;

  @IsString({ message: "Kota harus berupa teks" })
  @MaxLength(100, { message: "Kota maksimal 100 karakter" })
  readonly city: string;
}
