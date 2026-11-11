import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { TaskPriority } from '../../common/enums/index.js';
import { WeddingPlan } from '../../plans/entities/wedding-plan.entity.js';

/** Tugas persiapan di layar Rencana dan Beranda. */
@Index('idx_tasks_plan_done_due', ['planId', 'isDone', 'dueDate'])
@Entity({ name: 'tasks' })
export class Task extends AppBaseEntity {
  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @ManyToOne(() => WeddingPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: Relation<WeddingPlan>;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  /** Label kecil di kartu tugas: Venue, Vendor, Tamu, Acara, dst. */
  @Column({ type: 'varchar', length: 50, default: 'Umum' })
  category: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: string | null;

  @Column({ type: 'varchar', length: 20, default: TaskPriority.IMPORTANT })
  priority: TaskPriority;

  @Column({ name: 'is_done', type: 'boolean', default: false })
  isDone: boolean;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;
}