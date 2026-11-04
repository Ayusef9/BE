import { IsDateString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

/** Riwayat chat: pesan sebelum waktu tertentu (infinite scroll ke atas). */
export class QueryMessagesDto extends PaginationQueryDto {
  @IsOptional()
  @IsDateString({}, { message: "Waktu sebelumnya harus berupa tanggal yang valid" })
  readonly before?: string;
}
