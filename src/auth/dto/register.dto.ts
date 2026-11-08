import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty({ message: "Nama tidak boleh kosong" })
  @IsString({ message: "Nama harus berupa teks" })
  @MinLength(2, { message: "Nama minimal 2 karakter" })
  @MaxLength(150, { message: "Nama maksimal 150 karakter" })
  readonly name: string;

  @IsNotEmpty({ message: "Email tidak boleh kosong" })
  @IsEmail({}, { message: "Email harus berupa alamat email yang valid" })
  @MaxLength(150, { message: "Email maksimal 150 karakter" })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  readonly email: string;

  @IsNotEmpty({ message: "Password tidak boleh kosong" })
  @IsString({ message: "Password harus berupa teks" })
  @MinLength(8, { message: "Password minimal 8 karakter" })
  @MaxLength(10, { message: "Password maksimal 10 karakter" })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Password tidak sesuai dengan format yang ditentukan' })
  readonly password: string;

  @IsNotEmpty({message: "Konfirmasi password tidak boleh kosong"})
    @MinLength(3, {message: "Konfirmasi password minimal 3 karakter"})
    @MaxLength(16, {message: "Konfirmasi password maksimal 16 karakter"})
    readonly confirmPassword: string;
}
