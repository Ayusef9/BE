import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { WeddingPlan } from '../../plans/entities/wedding-plan.entity.js';
import { ChatbotMessage } from './chatbot-message.entity.js';

/** Percakapan dengan AI. Terpisah dari chat manusia (conversations). */
@Entity({ name: 'chatbot_sessions' })
export class ChatbotSession extends AppBaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'plan_id', type: 'uuid', nullable: true })
  planId: string | null;

  @ManyToOne(() => WeddingPlan, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'plan_id' })
  plan: Relation<WeddingPlan> | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  title: string | null;

  @OneToMany(() => ChatbotMessage, (m) => m.session)
  messages: ChatbotMessage[];
}
