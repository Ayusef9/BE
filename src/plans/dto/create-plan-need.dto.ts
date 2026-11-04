import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePlanNeedDto {
  @IsUUID("all", { message: "ID kategori harus berupa UUID yang valid" })
  readonly categoryId: string;

  @IsOptional()
  @IsString({ message: "Catatan harus berupa teks" })
  readonly notes?: string;
}
