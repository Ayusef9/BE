import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { ScheduleSource, ScheduleType } from '../../common/enums/index.js';
import { WeddingPlan } from '../../plans/entities/wedding-plan.entity.js';
import { Deal } from '../../deals/entities/deal.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Index('idx_schedules_plan_start', ['planId', 'startAt'])
@Index('idx_schedules_remind_at', ['remindAt'])
@Entity({ name: 'schedules' })
export class Schedule extends AppBaseEntity {
  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @ManyToOne(() => WeddingPlan, (plan) => plan.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: Relation<WeddingPlan>;

  // Sisi vendor membaca jadwal lewat deal.vendorId
  @Column({ name: 'deal_id', type: 'uuid', nullable: true })
  dealId: string | null;

  @ManyToOne(() => Deal, (deal) => deal.schedules, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deal_id' })
  deal: Relation<Deal> | null;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 30, default: ScheduleType.CUSTOM })
  type: ScheduleType;

  @Column({ type: 'varchar', length: 20, default: ScheduleSource.MANUAL })
  source: ScheduleSource;

  @Column({ name: 'start_at', type: 'timestamp' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamp', nullable: true })
  endAt: Date | null;

  @Column({ name: 'remind_at', type: 'timestamp', nullable: true })
  remindAt: Date | null;

  @Column({ name: 'is_done', type: 'boolean', default: false })
  isDone: boolean;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy: Relation<User> | null;
}
