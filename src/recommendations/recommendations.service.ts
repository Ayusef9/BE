import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommendationMode, VerificationStatus } from '../common/enums/index.js';
import { paginate } from '../common/utils/paginate.js';
import { PlansService } from '../plans/plans.service.js';
import { Package } from '../vendors/entities/package.entity.js';
import { ServiceItem } from '../vendors/entities/service-item.entity.js';
import type { QueryRecommendationDto } from './dto/query-recommendation.dto.js';

interface SearchContext {
  guestCount?: number;
  concept?: string;
  /** Sisa budget rencana. null jika tidak ada rencana atau budget belum diisi. */
  remaining: number | null;
}

const VENDOR_COLUMNS = ['v.id', 'v.storeName', 'v.city', 'v.logoUrl'];

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Package) private readonly packages: Repository<Package>,
    @InjectRepository(ServiceItem) private readonly items: Repository<ServiceItem>,
    private readonly plansService: PlansService,
  ) {}

  async search(userId: string, query: QueryRecommendationDto) {
    const context = await this.buildContext(userId, query);
    const result =
      query.mode === RecommendationMode.PACKAGE
        ? await this.searchPackages(query, context)
        : await this.searchItems(query, context);

    return { data: result.data, meta: { ...result.meta, remainingBudget: context.remaining } };
  }

  /** Jika ada planId, budget/tamu/konsep diambil dari rencana. Parameter query menimpa nilai rencana. */
  private async buildContext(userId: string, query: QueryRecommendationDto): Promise<SearchContext> {
    if (!query.planId) {
      return { guestCount: query.guestCount, concept: query.concept, remaining: null };
    }
    const plan = await this.plansService.assertMember(userId, query.planId); // 404 jika bukan anggota
    const budget = await this.plansService.computeBudget(plan);
    return {
      guestCount: query.guestCount ?? plan.guestCount ?? undefined,
      concept: query.concept ?? plan.concept ?? undefined,
      remaining: plan.totalBudget > 0 ? budget.remaining : null,
    };
  }

  // ---------------------------------------------------------------- mode paket

  private async searchPackages(query: QueryRecommendationDto, ctx: SearchContext) {
    const { page, limit } = query;
    const qb = this.packages
      .createQueryBuilder('p')
      .innerJoin('p.vendor', 'v')
      .addSelect(VENDOR_COLUMNS)
      .leftJoinAndSelect('p.packageItems', 'pi')
      .leftJoinAndSelect('pi.serviceItem', 'si')
      // hanya vendor yang sudah diverifikasi admin dan paket yang aktif
      .where('p.isActive = true')
      .andWhere('v.verificationStatus = :active', { active: VerificationStatus.ACTIVE })
      .andWhere('v.deletedAt IS NULL')
      .orderBy('p.price', 'ASC')
      .addOrderBy('p.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.maxPrice !== undefined) qb.andWhere('p.price <= :maxPrice', { maxPrice: query.maxPrice });
    if (ctx.guestCount !== undefined) {
      // batas kosong berarti tanpa batas
      qb.andWhere('(p.minGuests IS NULL OR p.minGuests <= :guests)', { guests: ctx.guestCount });
      qb.andWhere('(p.maxGuests IS NULL OR p.maxGuests >= :guests)');
    }
    if (ctx.concept) {
      // paket tanpa konsep dianggap cocok untuk semua konsep
      qb.andWhere('(p.concept IS NULL OR p.concept ILIKE :concept)', { concept: `%${ctx.concept}%` });
    }
    if (query.city) qb.andWhere('v.city ILIKE :city', { city: `%${query.city}%` });

    const [rows, total] = await qb.getManyAndCount();
    const data = rows.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      minGuests: p.minGuests,
      maxGuests: p.maxGuests,
      concept: p.concept,
      vendor: { id: p.vendor.id, storeName: p.vendor.storeName, city: p.vendor.city, logoUrl: p.vendor.logoUrl },
      items: p.packageItems.filter((pi) => pi.serviceItem).map((pi) => ({ id: pi.serviceItem.id, name: pi.serviceItem.name })),
      // penanda "melebihi sisa budget": tetap ditampilkan, hanya diberi tanda
      exceedsBudget: ctx.remaining !== null && p.price > ctx.remaining,
    }));
    return paginate(data, total, page, limit);
  }

  // ---------------------------------------------------------------- mode per-item

  private async searchItems(query: QueryRecommendationDto, ctx: SearchContext) {
    const { page, limit } = query;
    const qb = this.items
      .createQueryBuilder('i')
      .innerJoin('i.vendor', 'v')
      .addSelect(VENDOR_COLUMNS)
      .innerJoinAndSelect('i.category', 'c')
      .where('i.isActive = true')
      .andWhere('v.verificationStatus = :active', { active: VerificationStatus.ACTIVE })
      .andWhere('v.deletedAt IS NULL')
      .orderBy('i.price', 'ASC')
      .addOrderBy('i.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.categoryId) qb.andWhere('i.categoryId = :categoryId', { categoryId: query.categoryId });
    if (query.maxPrice !== undefined) qb.andWhere('i.price <= :maxPrice', { maxPrice: query.maxPrice });
    if (query.city) qb.andWhere('v.city ILIKE :city', { city: `%${query.city}%` });

    const [rows, total] = await qb.getManyAndCount();
    const data = rows.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      price: i.price,
      unit: i.unit,
      category: { id: i.category.id, name: i.category.name },
      vendor: { id: i.vendor.id, storeName: i.vendor.storeName, city: i.vendor.city, logoUrl: i.vendor.logoUrl },
      exceedsBudget: ctx.remaining !== null && i.price > ctx.remaining,
    }));
    return paginate(data, total, page, limit);
  }
}