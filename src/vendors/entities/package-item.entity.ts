import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Package } from './package.entity.js';
import { ServiceItem } from './service-item.entity.js';

/** Tabel penghubung many-to-many: packages <-> service_items. PK gabungan. */
@Entity({ name: 'package_items' })
export class PackageItem {
  @PrimaryColumn({ name: 'package_id', type: 'uuid' })
  packageId: string;

  @PrimaryColumn({ name: 'service_item_id', type: 'uuid' })
  serviceItemId: string;

  @ManyToOne(() => Package, (pkg) => pkg.packageItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: Relation<Package>;

  @ManyToOne(() => ServiceItem, (item) => item.packageItems, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_item_id' })
  serviceItem: Relation<ServiceItem>;
}
