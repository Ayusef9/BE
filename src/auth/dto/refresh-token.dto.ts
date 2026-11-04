import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: "Refresh token harus berupa teks" })
  readonly refreshToken: string;
}
