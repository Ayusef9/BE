import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgetPasswordDto {
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsEmail({}, { message: 'Email harus berupa alamat email yang valid' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  readonly email: string;
}