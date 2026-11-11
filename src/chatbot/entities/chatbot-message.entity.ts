import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { ChatbotRole } from '../../common/enums/index.js';
import { ChatbotSession } from './chatbot-session.entity.js';

@Entity({ name: 'chatbot_messages' })
export class ChatbotMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => ChatbotSession, (s) => s.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Relation<ChatbotSession>;

  @Column({ type: 'varchar', length: 20 })
  role: ChatbotRole;

  @Column({ type: 'text' })
  content: string;
  
  @Column({ type: 'jsonb', nullable: true })
  payload: { items: { title: string; subtitle: string }[]; suggestions: string[] } | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
