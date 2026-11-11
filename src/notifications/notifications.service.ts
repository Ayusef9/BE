// notifications/notifications.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { NotificationType } from '../common/enums/index.js';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { paginate } from '../common/utils/paginate.js';
import { Notification } from '../notifications/entities/notification-entity.js';

export interface NotifyInput {
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(@InjectRepository(Notification) private readonly repo: Repository<Notification>) {}

  /** Dipanggil modul lain. Kegagalan di sini tidak boleh menggagalkan proses utama. */
  async notify(userIds: string | string[], input: NotifyInput) {
    const ids = [...new Set(Array.isArray(userIds) ? userIds : [userIds])];
    if (!ids.length) return;
    try {
      await this.repo.insert(
        ids.map((userId) => ({
          userId,
          type: input.type,
          title: input.title,
          body: input.body ?? null,
          data: input.data ?? null,
        })),
      );
      // TODO push FCM ke device_tokens milik `ids` (butuh paket firebase-admin)
    } catch (err) {
      this.logger.warn(`Gagal membuat notifikasi: ${(err as Error).message}`);
    }
  }

  async list(userId: string, query: PaginationQueryDto) {
    const { page, limit } = query;
    const [rows, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(rows, total, page, limit);
  }

  async unreadCount(userId: string) {
    return { count: await this.repo.count({ where: { userId, isRead: false } }) };
  }

  async markRead(userId: string, id: string) {
    const result = await this.repo.update({ id, userId }, { isRead: true });
    if (!result.affected) throw new NotFoundException('Notifikasi tidak ditemukan');
  }

  async markAllRead(userId: string) {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
  }
}