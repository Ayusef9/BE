import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppSoftDeleteEntity } from '../../common/entities/base.entity.js';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';
import { Vendor } from './vendor.entity.js';
import { ServiceCategory } from './service-category.entity.js';
import { PackageItem } from './package-item.entity.js';

@Entity({ name: 'service_items' })
export class ServiceItem extends AppSoftDeleteEntity {
  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.serviceItems, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Relation<Vendor>;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => ServiceCategory, (category) => category.serviceItems, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Relation<ServiceCategory>;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: decimalTransformer })
  price: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  unit: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => PackageItem, (pi) => pi.serviceItem)
  packageItems: PackageItem[];
}
