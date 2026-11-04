import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/** POST /chatbot/messages */
export class SendChatbotMessageDto {
  // Kosongkan untuk memulai sesi baru
  @IsOptional()
  @IsUUID("all", { message: "ID sesi harus berupa UUID yang valid" })
  readonly sessionId?: string;

  // Konteks rencana agar chatbot membaca kebutuhan, jadwal, dan berkas
  @IsOptional()
  @IsUUID("all", { message: "ID rencana harus berupa UUID yang valid" })
  readonly planId?: string;

  @IsString({ message: "Pesan harus berupa teks" })
  @MinLength(1, { message: "Pesan minimal 1 karakter" })
  @MaxLength(2000, { message: "Pesan maksimal 2000 karakter" })
  readonly message: string;
}
