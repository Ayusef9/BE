import { Column, Entity, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { ServiceItem } from './service-item.entity.js';
import { PlanNeed } from '../../plans/entities/plan-need.entity.js';

@Entity({ name: 'service_categories' })
export class ServiceCategory extends AppBaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => ServiceItem, (item) => item.category)
  serviceItems: ServiceItem[];

  @OneToMany(() => PlanNeed, (need) => need.category)
  planNeeds: PlanNeed[];
}
