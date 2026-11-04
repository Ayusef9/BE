import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';
import { PlanNeed } from '../../plans/entities/plan-need.entity.js';
import { Deal } from '../../deals/entities/deal.entity.js';
import { User } from '../../users/entities/user.entity.js';

/**
 * Arsip bukti transaksi. OCR hanya membaca dan mengarsipkan,
 * bukan memverifikasi pembayaran.
 * Kolom ocr_* = hasil bacaan mesin; kolom tanpa prefix = nilai final dari pengguna.
 */
@Entity({ name: 'receipts' })
export class Receipt extends AppBaseEntity {
  @Column({ name: 'plan_need_id', type: 'uuid' })
  planNeedId: string;

  @ManyToOne(() => PlanNeed, (need) => need.receipts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_need_id' })
  planNeed: Relation<PlanNeed>;

  @Column({ name: 'deal_id', type: 'uuid', nullable: true })
  dealId: string | null;

  @ManyToOne(() => Deal, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deal_id' })
  deal: Relation<Deal> | null;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedById: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: Relation<User>;

  @Column({ name: 'image_path', type: 'varchar', length: 255 })
  imagePath: string;

  @Column({ name: 'processed_image_path', type: 'varchar', length: 255, nullable: true })
  processedImagePath: string | null;

  @Column({ name: 'ocr_raw_text', type: 'text', nullable: true })
  ocrRawText: string | null;

  @Column({ name: 'ocr_amount', type: 'decimal', precision: 14, scale: 2, nullable: true, transformer: decimalTransformer })
  ocrAmount: number | null;

  @Column({ name: 'ocr_date', type: 'date', nullable: true })
  ocrDate: string | null;

  @Column({ name: 'ocr_recipient', type: 'varchar', length: 150, nullable: true })
  ocrRecipient: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true, transformer: decimalTransformer })
  amount: number | null;

  @Column({ name: 'transaction_date', type: 'date', nullable: true })
  transactionDate: string | null;

  @Column({ name: 'recipient_name', type: 'varchar', length: 150, nullable: true })
  recipientName: string | null;

  @Column({ name: 'is_confirmed', type: 'boolean', default: false })
  isConfirmed: boolean;
}
