import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { DealStatus } from '../../common/enums/index.js';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';
import { PlanNeed } from '../../plans/entities/plan-need.entity.js';
import { Vendor } from '../../vendors/entities/vendor.entity.js';
import { Conversation } from '../../chat/entities/conversation.entity.js';
import { Package } from '../../vendors/entities/package.entity.js';
import { Schedule } from '../../scheduler/entities/schedule.entity.js';

@Index('idx_deals_need_status', ['planNeedId', 'status'])
@Index('idx_deals_vendor_status', ['vendorId', 'status'])
@Entity({ name: 'deals' })
export class Deal extends AppBaseEntity {
  // plan_id sengaja tidak disimpan: dapat ditelusuri lewat planNeed.plan
  @Column({ name: 'plan_need_id', type: 'uuid' })
  planNeedId: string;

  @ManyToOne(() => PlanNeed, (need) => need.deals, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_need_id' })
  planNeed: Relation<PlanNeed>;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Relation<Vendor>;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => Conversation, (c) => c.deals, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Relation<Conversation>;

  @Column({ name: 'package_id', type: 'uuid', nullable: true })
  packageId: string | null;

  @ManyToOne(() => Package, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'package_id' })
  package: Relation<Package> | null;

  // Snapshot nilai kesepakatan, tidak dihitung ulang dari harga katalog
  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: decimalTransformer })
  amount: number;

  @Column({ name: 'event_date', type: 'date' })
  eventDate: string;

  @Column({ type: 'varchar', length: 20, default: DealStatus.PENDING })
  status: DealStatus;

  @Column({ name: 'responded_at', type: 'timestamp', nullable: true })
  respondedAt: Date | null;

  @Column({ name: 'confirm_deadline', type: 'timestamp', nullable: true })
  confirmDeadline: Date | null;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date | null;

  @OneToMany(() => Schedule, (schedule) => schedule.deal)
  schedules: Schedule[];
}
