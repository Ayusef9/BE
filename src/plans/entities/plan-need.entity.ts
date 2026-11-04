import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { NeedStatus } from '../../common/enums/index.js';
import { WeddingPlan } from './wedding-plan.entity.js';
import { ServiceCategory } from '../../vendors/entities/service-category.entity.js';
import { Deal } from '../../deals/entities/deal.entity.js';
import { Receipt } from '../../documents/entities/receipt.entity.js';

// Satu kategori hanya boleh muncul sekali dalam satu rencana
@Unique('uq_plan_needs_plan_category', ['planId', 'categoryId'])
@Entity({ name: 'plan_needs' })
export class PlanNeed extends AppBaseEntity {
  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @ManyToOne(() => WeddingPlan, (plan) => plan.needs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: Relation<WeddingPlan>;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => ServiceCategory, (category) => category.planNeeds, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Relation<ServiceCategory>;

  @Column({ type: 'varchar', length: 30, default: NeedStatus.BELUM_DIPILIH })
  status: NeedStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => Deal, (deal) => deal.planNeed)
  deals: Deal[];

  @OneToMany(() => Receipt, (receipt) => receipt.planNeed)
  receipts: Receipt[];
}
