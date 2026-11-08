// chatbot/chatbot.service.ts
import { BadGatewayException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatbotRole } from '../common/enums/index.js';
import { PlansService } from '../plans/plans.service.js';
import type { SendChatbotMessageDto } from './dto/send-chatbot-message.dto.js';
import { ChatbotMessage } from './entities/chatbot-message.entity.js';
import { ChatbotSession } from './entities/chatbot-session.entity.js';

const HISTORY_LIMIT = 20; // jumlah pesan terakhir yang dikirim sebagai konteks

@Injectable()
export class ChatbotService {
  constructor(
    @InjectRepository(ChatbotSession) private readonly sessions: Repository<ChatbotSession>,
    @InjectRepository(ChatbotMessage) private readonly messages: Repository<ChatbotMessage>,
    private readonly plansService: PlansService,
    private readonly config: ConfigService,
  ) {}

  async sendMessage(userId: string, dto: SendChatbotMessageDto) {
    let session = dto.sessionId ? await this.findSession(userId, dto.sessionId) : null;
    const planId = dto.planId ?? session?.planId ?? null;
    if (planId) await this.plansService.assertMember(userId, planId);

    const history = session
      ? await this.messages.find({
          where: { sessionId: session.id },
          order: { createdAt: 'DESC' },
          take: HISTORY_LIMIT,
        })
      : [];
    history.reverse();

    // AI dipanggil dulu: kalau gagal, tidak ada pesan setengah tersimpan
    const reply = await this.askAi(await this.buildSystemPrompt(userId, planId), [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: ChatbotRole.USER, content: dto.message },
    ]);

    session ??= await this.sessions.save(
      this.sessions.create({ userId, planId, title: dto.message.slice(0, 150) }),
    );
    // dua save terpisah (bukan save([..])) agar created_at keduanya berbeda dan urutan riwayat stabil
    await this.messages.save(
      this.messages.create({ sessionId: session.id, role: ChatbotRole.USER, content: dto.message }),
    );
    await this.messages.save(
      this.messages.create({ sessionId: session.id, role: ChatbotRole.ASSISTANT, content: reply }),
    );
    return { sessionId: session.id, reply };
  }

  listSessions(userId: string) {
    return this.sessions.find({ where: { userId }, order: { updatedAt: 'DESC' } });
  }

  async getMessages(userId: string, sessionId: string) {
    await this.findSession(userId, sessionId);
    return this.messages.find({ where: { sessionId }, order: { createdAt: 'ASC' } });
  }

  async removeSession(userId: string, sessionId: string) {
    const session = await this.findSession(userId, sessionId);
    await this.sessions.delete(session.id); // pesan ikut terhapus (ON DELETE CASCADE)
  }

  // ---------------------------------------------------------------- helper

  private async findSession(userId: string, sessionId: string) {
    const session = await this.sessions.findOne({ where: { id: sessionId, userId } });
    if (!session) throw new NotFoundException('Sesi chatbot tidak ditemukan');
    return session;
  }

  private async buildSystemPrompt(userId: string, planId: string | null) {
    const base =
      'Kamu adalah asisten perencanaan pernikahan di aplikasi Wedding+. Jawab dalam bahasa Indonesia, singkat, dan praktis.';
    if (!planId) return base;

    const plan = await this.plansService.findOne(userId, planId);
    const budget = await this.plansService.getBudgetSummary(userId, planId);
    const needs = await this.plansService.listNeeds(userId, planId);

    return [
      base,
      '',
      'Konteks rencana pengguna:',
      `- Judul: ${plan.title}`,
      `- Tanggal: ${plan.weddingDate ?? 'belum ditentukan'}`,
      `- Jumlah tamu: ${plan.guestCount ?? 'belum ditentukan'}`,
      `- Budget: total ${budget.totalBudget}, terpakai ${budget.committed}, sisa ${budget.remaining}`,
      `- Kebutuhan: ${needs.map((n) => `${n.category.name} (${n.status})`).join(', ')}`,
    ].join('\n');
  }

  private async askAi(system: string, messages: { role: ChatbotRole; content: string }[]): Promise<string> {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) throw new ServiceUnavailableException('Chatbot belum dikonfigurasi');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.get<string>('CHATBOT_MODEL', 'claude-sonnet-5-5'),
        max_tokens: 1000,
        system,
        messages,
      }),
    });
    if (!res.ok) throw new BadGatewayException('Chatbot sedang tidak dapat dihubungi');

    const data = (await res.json()) as { content: { type: string; text?: string }[] };
    return data.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('')
      .trim();
  }
}