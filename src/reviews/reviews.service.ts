import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { DealStatus, NotificationType } from '../common/enums/index.js';
import { paginate } from '../common/utils/paginate.js';
import { Deal } from '../deals/entities/deal.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PlansService } from '../plans/plans.service.js';
import { Vendor } from '../vendors/entities/vendor.entity.js';
import type { CreateReviewDto } from './dto/create-review-dto.js';
import type { QueryReviewDto } from './dto/query-review-dto.js';
import { Review } from '../reviews/entities/review-entity.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviews: Repository<Review>,
    @InjectRepository(Deal) private readonly deals: Repository<Deal>,
    private readonly plansService: PlansService,
    private readonly notifications: NotificationsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    const deal = await this.deals.findOne({
      where: { id: dto.dealId },
      relations: { planNeed: true, vendor: true },
    });
    if (!deal) throw new NotFoundException('Kesepakatan tidak ditemukan');
    await this.plansService.assertMember(userId, deal.planNeed.planId);
    if (deal.status !== DealStatus.ACCEPTED) {
      throw new BadRequestException('Ulasan hanya dapat diberikan untuk kesepakatan yang disetujui vendor');
    }
    if (await this.reviews.exists({ where: { dealId: deal.id } })) {
      throw new ConflictException('Kesepakatan ini sudah diulas');
    }

    const review = await this.dataSource.transaction(async (m) => {
      const saved = await m.save(
        m.create(Review, { vendorId: deal.vendorId, userId, dealId: deal.id, rating: dto.rating, comment: dto.comment ?? null }),
      );
      await this.recomputeVendor(m, deal.vendorId);
      return saved;
    });

    await this.notifications.notify(deal.vendor.userId, {
      type: NotificationType.REVIEW,
      title: 'Ulasan baru',
      body: `Anda mendapat rating ${dto.rating} dari 5`,
      data: { vendorId: deal.vendorId, reviewId: review.id },
    });
    return review;
  }

  async listByVendor(query: QueryReviewDto) {
    const { page, limit, vendorId } = query;
    const [rows, total] = await this.reviews.findAndCount({
      where: { vendorId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    // hanya nama yang ditampilkan, data pribadi pengulas tidak ikut keluar
    const data = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      user: { id: r.user.id, name: r.user.nickname ?? r.user.name, avatarUrl: r.user.avatarUrl },
    }));
    return paginate(data, total, page, limit);
  }

  async remove(userId: string, id: string) {
    const review = await this.reviews.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Ulasan tidak ditemukan');
    if (review.userId !== userId) throw new ForbiddenException('Hanya pemilik ulasan yang dapat menghapusnya');
    await this.dataSource.transaction(async (m) => {
      await m.delete(Review, id);
      await this.recomputeVendor(m, review.vendorId);
    });
  }

  /** Rata-rata dan jumlah ulasan disimpan di vendor supaya daftar rekomendasi tidak perlu menghitung ulang. */
  private async recomputeVendor(m: EntityManager, vendorId: string) {
    const row = await m
      .createQueryBuilder(Review, 'r')
      .select('COALESCE(AVG(r.rating), 0)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.vendorId = :vendorId', { vendorId })
      .getRawOne<{ avg: string; count: string }>();
    await m.update(Vendor, vendorId, {
      ratingAvg: Math.round(Number(row?.avg ?? 0) * 100) / 100,
      reviewCount: Number(row?.count ?? 0),
    });
  }
}