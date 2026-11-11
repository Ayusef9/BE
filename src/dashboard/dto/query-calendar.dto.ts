// dashboard/dto/query-calendar.dto.ts
import { IsUUID, Matches } from 'class-validator';

export class QueryCalendarDto {
  @IsUUID('all', { message: 'ID rencana harus berupa UUID yang valid' })
  readonly planId: string;

  /** Format YYYY-MM, mis. 2026-06 */
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'Bulan harus berformat YYYY-MM' })
  readonly month: string;
}

export class QueryDayDto {
  @IsUUID('all', { message: 'ID rencana harus berupa UUID yang valid' })
  readonly planId: string;

  /** Format YYYY-MM-DD */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Tanggal harus berformat YYYY-MM-DD' })
  readonly date: string;
}