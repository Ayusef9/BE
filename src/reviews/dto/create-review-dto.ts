import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
  @IsUUID('all', { message: 'ID kesepakatan harus berupa UUID yang valid' })
  readonly dealId: string;

  @IsInt({ message: 'Rating harus berupa angka bulat' })
  @Min(1, { message: 'Rating minimal 1' })
  @Max(5, { message: 'Rating maksimal 5' })
  readonly rating: number;

  @IsOptional()
  @IsString({ message: 'Komentar harus berupa teks' })
  @MaxLength(1000, { message: 'Komentar maksimal 1000 karakter' })
  readonly comment?: string;
}