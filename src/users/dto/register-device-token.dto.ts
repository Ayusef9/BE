import { IsEnum, IsString, MaxLength } from 'class-validator';
import { DevicePlatform } from '../../common/enums/index.js';

export class RegisterDeviceTokenDto {
  @IsString({ message: "Token perangkat harus berupa teks" })
  @MaxLength(255255, { message: "Token perangkat maksimal 255 karakter" })
  readonly fcmToken: string;

  @IsEnum(DevicePlatform, { message: "Platform memiliki nilai yang tidak valid" })
  readonly platform: DevicePlatform;
}
