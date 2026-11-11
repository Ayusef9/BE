import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { WeddingPlan } from '../../plans/entities/wedding-plan.entity.js';
import { DocumentScan } from '../../documents/entities/document-scan.entity.js';

@Entity({ name: 'document_tasks' })
export class DocumentTask extends AppBaseEntity {
  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @ManyToOne(() => WeddingPlan, (plan) => plan.documentTasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: Relation<WeddingPlan>;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: string | null;

  @Column({ name: 'is_done', type: 'boolean', default: false })
  isDone: boolean;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @OneToMany(() => DocumentScan, (scan) => scan.task)
  scans: DocumentScan[];
}
