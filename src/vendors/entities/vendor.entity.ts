import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppSoftDeleteEntity } from '../../common/entities/base.entity.js';
import { VerificationStatus } from '../../common/enums/index.js';
import { User } from '../../users/entities/user.entity.js';
import { ServiceItem } from './service-item.entity.js';
import { Package } from './package.entity.js';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';

@Entity({ name: 'vendors' })
export class Vendor extends AppSoftDeleteEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.vendor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'store_name', type: 'varchar', length: 150 })
  storeName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 255, nullable: true })
  logoUrl: string | null;

  @Column({ name: 'rating_avg', type: 'decimal', precision: 3, scale: 2, default: 0, transformer: decimalTransformer })
  ratingAvg: number;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @Column({
    name: 'verification_status',
    type: 'varchar',
    length: 20,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedById: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy: Relation<User> | null;

  @OneToMany(() => ServiceItem, (item) => item.vendor)
  serviceItems: ServiceItem[];

  @OneToMany(() => Package, (pkg) => pkg.vendor)
  packages: Package[];
}
