import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NeedStatus } from '../../common/enums/index.js';

export class UpdatePlanNeedDto {
  @IsOptional()
  @IsEnum(NeedStatus, { message: "Status memiliki nilai yang tidak valid" })
  readonly status?: NeedStatus;

  @IsOptional()
  @IsString({ message: "Catatan harus berupa teks" })
  readonly notes?: string;
}
