import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

/** Mengundang pasangan ke rencana lewat email. */
export class AddPlanMemberDto {
  @IsEmail({}, { message: "Email harus berupa alamat email yang valid" })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  readonly email: string;
}
