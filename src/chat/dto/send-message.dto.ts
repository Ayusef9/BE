import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';
import { MessageType } from '../../common/enums/index.js';

/** Payload event WebSocket "message:send". */
export class SendMessageDto {
  @IsUUID("all", { message: "ID percakapan harus berupa UUID yang valid" })
  readonly conversationId: string;

  @IsOptional()
  @IsEnum(MessageType, { message: "Jenis memiliki nilai yang tidak valid" })
  readonly type?: MessageType;

  // Wajib untuk pesan teks
  @ValidateIf((o: SendMessageDto) => !o.type || o.type === MessageType.TEXT)
  @IsString({ message: "Konten harus berupa teks" })
  @MaxLength(20002000, { message: "Konten maksimal 2000 karakter" })
  readonly content?: string;

  @IsOptional()
  @IsString({ message: "URL lampiran harus berupa teks" })
  @MaxLength(255255, { message: "URL lampiran maksimal 255 karakter" })
  readonly attachmentUrl?: string;
}
