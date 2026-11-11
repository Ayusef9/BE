import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { WeddingPlan } from '../../plans/entities/wedding-plan.entity.js';
import { Vendor } from '../../vendors/entities/vendor.entity.js';
import { Message } from './message.entity.js';
import { Deal } from '../../deals/entities/deal.entity.js';
import { Package } from '../../vendors/entities/package.entity.js';

// Satu ruang chat per (rencana, vendor)
@Unique('uq_conversations_plan_vendor', ['planId', 'vendorId'])
@Entity({ name: 'conversations' })
export class Conversation extends AppBaseEntity {
  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @ManyToOne(() => WeddingPlan, (plan) => plan.conversations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: Relation<WeddingPlan>;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Relation<Vendor>;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt: Date | null;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @Column({ name: 'origin_package_id', type: 'uuid', nullable: true })
  originPackageId: string | null;

  @ManyToOne(() => Package, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'origin_package_id' })
  originPackage: Relation<Package> | null;

  @OneToMany(() => Deal, (deal) => deal.conversation)
  deals: Deal[];
}
