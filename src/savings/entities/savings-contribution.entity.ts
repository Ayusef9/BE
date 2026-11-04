import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';
import { User } from '../../users/entities/user.entity.js';
import { SavingsGoal } from './savings-goal.entity.js';

@Entity({ name: 'savings_contributions' })
export class SavingsContribution extends AppBaseEntity {
  @Column({ name: 'goal_id', type: 'uuid' })
  goalId: string;

  @ManyToOne(() => SavingsGoal, (goal) => goal.contributions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goal_id' })
  goal: Relation<SavingsGoal>;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: decimalTransformer })
  amount: number;

  @Column({ name: 'contributed_at', type: 'date' })
  contributedAt: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;
}
