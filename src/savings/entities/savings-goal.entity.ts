import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';
import { WeddingPlan } from '../../plans/entities/wedding-plan.entity.js';
import { SavingsContribution } from './savings-contribution.entity.js';
import { SavingsNote } from './savings-note.entity.js';

/** Hanya pencatatan. Tidak ada deposit atau transaksi uang lewat sistem. */
@Entity({ name: 'savings_goals' })
export class SavingsGoal extends AppBaseEntity {
  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @ManyToOne(() => WeddingPlan, (plan) => plan.savingsGoals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: Relation<WeddingPlan>;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ name: 'target_amount', type: 'decimal', precision: 14, scale: 2, transformer: decimalTransformer })
  targetAmount: number;

  // Jika true, target mengikuti wedding_plans.total_budget
  @Column({ name: 'use_total_budget', type: 'boolean', default: false })
  useTotalBudget: boolean;

  @OneToMany(() => SavingsContribution, (c) => c.goal)
  contributions: SavingsContribution[];

  @OneToMany(() => SavingsNote, (n) => n.goal)
  notes: SavingsNote[];
}
