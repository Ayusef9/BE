import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateServiceCategoryDto {
  @IsString({ message: "Nama harus berupa teks" })
  @MaxLength(100, { message: "Nama maksimal 100 karakter" })
  readonly name: string;

  @IsOptional()
  @IsString({ message: "Ikon harus berupa teks" })
  @MaxLength(100, { message: "Ikon maksimal 100 karakter" })
  readonly icon?: string;

  @IsOptional()
  @IsInt({ message: "Urutan harus berupa angka bulat" })
  @Min(0, { message: "Urutan minimal 0" })
  readonly sortOrder?: number;
}

export class UpdateServiceCategoryDto extends PartialType(CreateServiceCategoryDto) {}
