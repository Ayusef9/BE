import { IsDateString, IsOptional, IsUUID } from 'class-validator';

/** GET /schedules?planId=...&from=2027-01-01&to=2027-01-31 */
export class QueryScheduleDto {
  @IsOptional()
  @IsUUID("all", { message: "ID rencana harus berupa UUID yang valid" })
  readonly planId?: string;

  @IsOptional()
  @IsDateString({}, { message: "Tanggal awal harus berupa tanggal yang valid" })
  readonly from?: string;

  @IsOptional()
  @IsDateString({}, { message: "Tanggal akhir harus berupa tanggal yang valid" })
  readonly to?: string;
}
