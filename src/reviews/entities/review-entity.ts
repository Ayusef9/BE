import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { Deal } from '../../deals/entities/deal.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Vendor } from '../../vendors/entities/vendor.entity.js';

/** Satu ulasan per kesepakatan (deal), supaya hanya pengguna yang benar-benar memesan yang bisa menilai. */
@Unique('uq_reviews_deal', ['dealId'])
@Index('idx_reviews_vendor_created', ['vendorId', 'createdAt'])
@Entity({ name: 'reviews' })
export class Review extends AppBaseEntity {
  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Relation<Vendor>;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'deal_id', type: 'uuid' })
  dealId: string;

  @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deal_id' })
  deal: Relation<Deal>;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;
}