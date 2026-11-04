import { IsOptional, IsUUID } from 'class-validator';

/**
 * Body multipart untuk POST /documents/receipts.
 * File gambar dikirim di field "file" (FileInterceptor), bukan di DTO ini.
 */
export class UploadReceiptDto {
  @IsUUID("all", { message: "ID kebutuhan rencana harus berupa UUID yang valid" })
  readonly planNeedId: string;

  @IsOptional()
  @IsUUID("all", { message: "Deal Id harus berupa UUID yang valid" })
  readonly dealId?: string;
}
