import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsString, MaxLength, Min } from 'class-validator';

/**
 * User mengoreksi hasil bacaan OCR lalu mengonfirmasi:
 * PATCH /documents/receipts/:id/confirm
 */
export class ConfirmReceiptDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Jumlah harus berupa angka" })
  @Min(0, { message: "Jumlah minimal 0" })
  readonly amount: number;

  @IsDateString({}, { message: "Tanggal transaksi harus berupa tanggal yang valid" })
  readonly transactionDate: string;

  @IsString({ message: "Nama penerima harus berupa teks" })
  @MaxLength(150, { message: "Nama penerima maksimal 150 karakter" })
  readonly recipientName: string;
}
