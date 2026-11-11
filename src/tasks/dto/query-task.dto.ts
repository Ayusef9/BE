import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class QueryTaskDto {
  @IsUUID('all', { message: 'ID rencana harus berupa UUID yang valid' })
  readonly planId: string;

  /** Tab di layar Rencana: Semua / Belum selesai / Selesai */
  @IsOptional()
  @IsIn(['all', 'open', 'done'], { message: 'Status harus berupa all, open, atau done' })
  readonly status: 'all' | 'open' | 'done' = 'all';

  /** due = terdekat, priority = paling penting dulu */
  @IsOptional()
  @IsIn(['due', 'priority'], { message: 'Urutan harus berupa due atau priority' })
  readonly sort: 'due' | 'priority' = 'due';
}