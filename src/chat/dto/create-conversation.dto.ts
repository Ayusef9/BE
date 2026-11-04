import { IsUUID } from 'class-validator';

/** Tombol "Hubungi vendor": membuat (atau membuka) ruang chat. */
export class CreateConversationDto {
  @IsUUID("all", { message: "ID rencana harus berupa UUID yang valid" })
  readonly planId: string;

  @IsUUID("all", { message: "ID vendor harus berupa UUID yang valid" })
  readonly vendorId: string;
}
