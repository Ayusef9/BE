import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString({ message: "Nama harus berupa teks" })
  @MinLength(2, { message: "Nama minimal 2 karakter" })
  @MaxLength(150, { message: "Nama maksimal 150 karakter" })
  readonly name: string;

  @IsEmail({}, { message: "Email harus berupa alamat email yang valid" })
  @MaxLength(150, { message: "Email maksimal 150 karakter" })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  readonly email: string;

  @IsString({ message: "Password harus berupa teks" })
  @MinLength(8, { message: "Password minimal 8 karakter" })
  @MaxLength(10, { message: "Password maksimal 10 karakter" })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Password tidak sesuai dengan format yang ditentukan' })
  readonly password: string;

  @IsOptional()
  @Matches(/^[0-9+]{8,20}$/, { message: 'Nomor telepon tidak sesuai dengan format yang ditentukan' })
  readonly phone?: string;
}
