import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { SavingsGoal } from './savings-goal.entity.js';

/** Notulen kesepakatan keuangan berdua. */
@Entity({ name: 'savings_notes' })
export class SavingsNote extends AppBaseEntity {
  @Column({ name: 'goal_id', type: 'uuid' })
  goalId: string;

  @ManyToOne(() => SavingsGoal, (goal) => goal.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goal_id' })
  goal: Relation<SavingsGoal>;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'author_id' })
  author: Relation<User>;

  @Column({ type: 'text' })
  content: string;
}
