// users/dto/change-password.dto.ts
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Password lama tidak boleh kosong' })
  @IsString({ message: 'Password lama harus berupa teks' })
  readonly oldPassword: string;

  @IsNotEmpty({ message: 'Password baru tidak boleh kosong' })
  @IsString({ message: 'Password baru harus berupa teks' })
  @MinLength(8, { message: 'Password baru minimal 8 karakter' })
  @MaxLength(16, { message: 'Password baru maksimal 16 karakter' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Password baru harus mengandung huruf dan angka' })
  readonly newPassword: string;

  @IsNotEmpty({ message: 'Konfirmasi password tidak boleh kosong' })
  @IsString({ message: 'Konfirmasi password harus berupa teks' })
  readonly confirmPassword: string;
}