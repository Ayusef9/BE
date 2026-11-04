import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { MemberRole } from '../../common/enums/index.js';
import { User } from '../../users/entities/user.entity.js';
import { WeddingPlan } from './wedding-plan.entity.js';

/** Tabel penghubung many-to-many: wedding_plans <-> users. PK gabungan. */
@Entity({ name: 'plan_members' })
export class PlanMember {
  @PrimaryColumn({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => WeddingPlan, (plan) => plan.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: Relation<WeddingPlan>;

  @ManyToOne(() => User, (user) => user.planMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'member_role', type: 'varchar', length: 20, default: MemberRole.PARTNER })
  memberRole: MemberRole;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
