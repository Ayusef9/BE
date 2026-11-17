import { Transform } from 'class-transformer';
import { Equals, IsBoolean, IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @IsString({ message: 'Nama harus berupa teks' })
  @MinLength(2, { message: 'Nama minimal 2 karakter' })
  @MaxLength(150, { message: 'Nama maksimal 150 karakter' })
  readonly name: string;

  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsEmail({}, { message: 'Email harus berupa alamat email yang valid' })
  @MaxLength(150, { message: 'Email maksimal 150 karakter' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  readonly email: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(16, { message: 'Password maksimal 16 karakter' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Password harus mengandung huruf dan angka' })
  readonly password: string;

  @IsNotEmpty({ message: 'Konfirmasi password tidak boleh kosong' })
  @IsString({ message: 'Konfirmasi password harus berupa teks' })
  readonly confirmPassword: string;

  /** Checkbox "Saya setuju Syarat & Ketentuan" di layar Registrasi */
  @IsBoolean({ message: 'Persetujuan Syarat & Ketentuan harus berupa nilai boolean' })
  @Equals(true, { message: 'Anda harus menyetujui Syarat & Ketentuan' })
  readonly acceptTerms: boolean;
}