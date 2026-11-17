import { IsDateString, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Gender } from '../../common/enums/index.js';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Nama harus berupa teks' })
  @MinLength(2, { message: 'Nama minimal 2 karakter' })
  @MaxLength(150, { message: 'Nama maksimal 150 karakter' })
  readonly name?: string;

  @IsOptional()
  @IsString({ message: 'Nama panggilan harus berupa teks' })
  @MinLength(2, { message: 'Nama panggilan minimal 2 karakter' })
  @MaxLength(50, { message: 'Nama panggilan maksimal 50 karakter' })
  readonly nickname?: string;

  @IsOptional()
  @Matches(/^[0-9+]{8,20}$/, { message: 'Nomor telepon tidak sesuai dengan format yang ditentukan' })
  readonly phone?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Tanggal lahir harus berupa tanggal yang valid' })
  readonly birthDate?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Gender memiliki nilai yang tidak valid' })
  readonly gender?: Gender;

  @IsOptional()
  @IsString({ message: 'Kota harus berupa teks' })
  @MaxLength(100, { message: 'Kota maksimal 100 karakter' })
  readonly city?: string;

  @IsOptional()
  @IsString({ message: 'Provinsi harus berupa teks' })
  @MaxLength(100, { message: 'Provinsi maksimal 100 karakter' })
  readonly province?: string;
}