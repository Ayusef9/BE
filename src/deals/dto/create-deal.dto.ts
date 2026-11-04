import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateDealDto {
  @IsUUID("all", { message: "ID percakapan harus berupa UUID yang valid" })
  readonly conversationId: string;

  @IsUUID("all", { message: "ID kebutuhan rencana harus berupa UUID yang valid" })
  readonly planNeedId: string;

  @IsOptional()
  @IsUUID("all", { message: "ID paket harus berupa UUID yang valid" })
  readonly packageId?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Jumlah harus berupa angka" })
  @Min(0, { message: "Jumlah minimal 0" })
  readonly amount: number;

  @IsDateString({}, { message: "Event Date harus berupa tanggal yang valid" })
  readonly eventDate: string;
}
