// chat/chat.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { MessageType, Role, VerificationStatus } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { isUniqueViolation } from '../common/utils/db-errors.js';
import { PlansService } from '../plans/plans.service.js';
import { Vendor } from '../vendors/entities/vendor.entity.js';
import { VendorsService } from '../vendors/vendors.service.js';
import type { CreateConversationDto } from './dto/create-conversation.dto.js';
import type { QueryMessagesDto } from './dto/query-messages.dto.js';
import type { SendMessageDto } from './dto/send-message.dto.js';
import { Conversation } from './entities/conversation.entity.js';
import { Message } from './entities/message.entity.js';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation) private readonly conversations: Repository<Conversation>,
    @InjectRepository(Message) private readonly messages: Repository<Message>,
    @InjectRepository(Vendor) private readonly vendors: Repository<Vendor>,
    private readonly plansService: PlansService,
    private readonly vendorsService: VendorsService,
  ) {}

  /** Tombol "Hubungi vendor": membuka ruang chat yang sudah ada, atau membuat yang baru. */
  async openConversation(userId: string, dto: CreateConversationDto) {
    await this.plansService.assertMember(userId, dto.planId);
    const vendor = await this.vendors.findOne({
      where: { id: dto.vendorId, verificationStatus: VerificationStatus.ACTIVE },
    });
    if (!vendor) throw new NotFoundException('Vendor tidak ditemukan');

    const where = { planId: dto.planId, vendorId: dto.vendorId };
    const existing = await this.conversations.findOne({ where });
    if (existing) return existing;
    try {
      return await this.conversations.save(this.conversations.create(where));
    } catch (err) {
      if (isUniqueViolation(err)) return this.conversations.findOneOrFail({ where }); // balapan dua request
      throw err;
    }
  }

  async findMine(user: AuthUser) {
    const qb = this.conversations
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.vendor', 'v')
      // kolom rencana dibatasi supaya vendor tidak ikut melihat budget
      .innerJoin('c.plan', 'p')
      .addSelect(['p.id', 'p.title', 'p.weddingDate'])
      .orderBy('c.lastMessageAt', 'DESC', 'NULLS LAST');

    if (user.role === Role.VENDOR) {
      const vendor = await this.vendorsService.findMine(user.id);
      qb.where('c.vendorId = :vendorId', { vendorId: vendor.id });
    } else {
      qb.innerJoin('p.members', 'me', 'me.userId = :userId', { userId: user.id });
    }
    return qb.getMany();
  }

  /** Riwayat chat, terbaru dulu. Untuk memuat yang lebih lama kirim `before` (createdAt pesan tertua). */
  async getMessages(user: AuthUser, conversationId: string, query: QueryMessagesDto) {
    await this.assertAccess(user, conversationId);
    const qb = this.messages
      .createQueryBuilder('m')
      .where('m.conversationId = :conversationId', { conversationId })
      .orderBy('m.createdAt', 'DESC')
      .take(query.limit);
    if (query.before) qb.andWhere('m.createdAt < :before', { before: new Date(query.before) });
    return qb.getMany();
  }

  async sendMessage(user: AuthUser, dto: SendMessageDto) {
    const conversation = await this.assertAccess(user, dto.conversationId);
    const type = dto.type ?? MessageType.TEXT;

    if (type === MessageType.SYSTEM) throw new BadRequestException('Pesan sistem tidak dapat dikirim manual');
    if (type === MessageType.TEXT && !dto.content?.trim()) {
      throw new BadRequestException('Pesan tidak boleh kosong');
    }
    if (type === MessageType.IMAGE && !dto.attachmentUrl) {
      throw new BadRequestException('Lampiran wajib diisi untuk pesan gambar');
    }

    const message = await this.messages.save(
      this.messages.create({
        conversationId: conversation.id,
        senderId: user.id,
        type,
        content: dto.content ?? null,
        attachmentUrl: dto.attachmentUrl ?? null,
      }),
    );
    await this.conversations.update(conversation.id, { lastMessageAt: message.createdAt });
    return message;
  }

  /** Menandai pesan lawan bicara sebagai terbaca. */
  async markRead(user: AuthUser, conversationId: string) {
    await this.assertAccess(user, conversationId);
    await this.messages.update({ conversationId, senderId: Not(user.id), isRead: false }, { isRead: true });
  }

  /** Hanya anggota rencana atau vendor pemilik ruang chat yang boleh masuk. 404 agar keberadaannya tidak bocor. */
  async assertAccess(user: AuthUser, conversationId: string) {
    const conversation = await this.conversations.findOne({
      where: { id: conversationId },
      relations: { vendor: true },
    });
    if (!conversation) throw new NotFoundException('Percakapan tidak ditemukan');

    if (user.role === Role.VENDOR) {
      if (conversation.vendor.userId !== user.id) throw new NotFoundException('Percakapan tidak ditemukan');
    } else {
      await this.plansService.assertMember(user.id, conversation.planId);
    }
    return conversation;
  }
}