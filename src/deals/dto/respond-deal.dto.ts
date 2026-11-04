import { IsIn, IsOptional, IsString, ValidateIf } from 'class-validator';
import { DealStatus } from '../../common/enums/index.js';

/** Vendor meng-ACC atau menolak deal: PATCH /deals/:id/respond */
export class RespondDealDto {
  @IsIn([DealStatus.ACCEPTED, DealStatus.REJECTED], { message: "Status memiliki nilai yang tidak valid" })
  readonly status: DealStatus.ACCEPTED | DealStatus.REJECTED;

  @ValidateIf((o: RespondDealDto) => o.status === DealStatus.REJECTED)
  @IsOptional()
  @IsString({ message: "Alasan harus berupa teks" })
  readonly reason?: string;
}
