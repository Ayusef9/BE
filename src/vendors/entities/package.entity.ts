import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppSoftDeleteEntity } from '../../common/entities/base.entity.js';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';
import { Vendor } from './vendor.entity.js';
import { PackageItem } from './package-item.entity.js';

@Entity({ name: 'packages' })
export class Package extends AppSoftDeleteEntity {
  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.packages, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Relation<Vendor>;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: decimalTransformer })
  price: number;

  @Column({ name: 'min_guests', type: 'int', nullable: true })
  minGuests: number | null;

  @Column({ name: 'max_guests', type: 'int', nullable: true })
  maxGuests: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  concept: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'price_unit', type: 'varchar', length: 30, default: 'paket' })
  priceUnit: string;

  @OneToMany(() => PackageItem, (pi) => pi.package, { cascade: true })
  packageItems: PackageItem[];
}
