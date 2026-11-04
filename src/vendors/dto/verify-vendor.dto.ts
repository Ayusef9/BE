import { IsIn, IsString, ValidateIf } from 'class-validator';
import { VerificationStatus } from '../../common/enums/index.js';

/** Dipakai admin: PATCH /vendors/:id/verify */
export class VerifyVendorDto {
  @IsIn([VerificationStatus.ACTIVE, VerificationStatus.REJECTED], { message: "Status memiliki nilai yang tidak valid" })
  readonly status: VerificationStatus.ACTIVE | VerificationStatus.REJECTED;

  // Wajib diisi jika ditolak
  @ValidateIf((o: VerifyVendorDto) => o.status === VerificationStatus.REJECTED)
  @IsString({ message: "Alasan penolakan harus berupa teks" })
  readonly rejectionReason?: string;
}
