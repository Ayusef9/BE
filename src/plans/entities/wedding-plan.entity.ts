import { Column, Entity, OneToMany } from 'typeorm';
import { AppSoftDeleteEntity } from '../../common/entities/base.entity.js';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';
import { PlanMember } from './plan-member.entity.js';
import { PlanNeed } from './plan-need.entity.js';
import { Conversation } from '../../chat/entities/conversation.entity.js';
import { Schedule } from '../../scheduler/entities/schedule.entity.js';
import { DocumentTask } from '../../documents/entities/document-task.entity.js';
import { SavingsGoal } from '../../savings/entities/savings-goal.entity.js';

@Entity({ name: 'wedding_plans' })
export class WeddingPlan extends AppSoftDeleteEntity {
  @Column({ type: 'varchar', length: 150 })
  title: string;

  // Wizard boleh dilewati -> kolom isian dibuat nullable, diisi bertahap
  @Column({ name: 'wedding_date', type: 'date', nullable: true })
  weddingDate: string | null;

  @Column({
    name: 'total_budget',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  totalBudget: number;

  @Column({ name: 'guest_count', type: 'int', nullable: true })
  guestCount: number | null;

  @Column({ name: 'venue_type', type: 'varchar', length: 50, nullable: true })
  venueType: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  concept: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @OneToMany(() => PlanMember, (m) => m.plan)
  members: PlanMember[];

  @OneToMany(() => PlanNeed, (n) => n.plan)
  needs: PlanNeed[];

  @OneToMany(() => Conversation, (c) => c.plan)
  conversations: Conversation[];

  @OneToMany(() => Schedule, (s) => s.plan)
  schedules: Schedule[];

  @OneToMany(() => DocumentTask, (d) => d.plan)
  documentTasks: DocumentTask[];

  @OneToMany(() => SavingsGoal, (g) => g.plan)
  savingsGoals: SavingsGoal[];
}
