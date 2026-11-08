// deals/deals.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Conversation } from '../chat/entities/conversation.entity.js';
import { Message } from '../chat/entities/message.entity.js';
import {
  DealStatus,
  MessageType,
  NeedStatus,
  Role,
  ScheduleSource,
  ScheduleType,
} from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { paginate } from '../common/utils/paginate.js';
import { PlanNeed } from '../plans/entities/plan-need.entity.js';
import { PlansService } from '../plans/plans.service.js';
import { Schedule } from '../scheduler/entities/schedule.entity.js';
import { Package } from '../vendors/entities/package.entity.js';
import { VendorsService } from '../vendors/vendors.service.js';
import type { CreateDealDto } from './dto/create-deal.dto.js';
import type { QueryDealDto } from './dto/query-deal.dto.js';
import type { RespondDealDto } from './dto/respond-deal.dto.js';
import { Deal } from './entities/deal.entity.js';

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal) private readonly deals: Repository<Deal>,
    @InjectRepository(Conversation) private readonly conversations: Repository<Conversation>,
    @InjectRepository(PlanNeed) private readonly needs: Repository<PlanNeed>,
    @InjectRepository(Package) private readonly packages: Repository<Package>,
    private readonly plansService: PlansService,
    private readonly vendorsService: VendorsService,
    private readonly dataSource: DataSource,
  ) {}

  /** User mengajukan permintaan ke vendor (dari ruang chat). */
  async create(userId: string, dto: CreateDealDto) {
    const conversation = await this.conversations.findOne({ where: { id: dto.conversationId } });
    if (!conversation) throw new NotFoundException('Percakapan tidak ditemukan');
    await this.plansService.assertMember(userId, conversation.planId);

    const need = await this.needs.findOne({ where: { id: dto.planNeedId, planId: conversation.planId } });
    if (!need) throw new BadRequestException('Kebutuhan tidak ditemukan di rencana ini');
    if (need.status === NeedStatus.DISEPAKATI || need.status === NeedStatus.BUKTI_TERUNGGAH) {
      throw new ConflictException('Kebutuhan ini sudah disepakati dengan vendor');
    }
    if (
      dto.packageId &&
      !(await this.packages.exists({ where: { id: dto.packageId, vendor: { id: conversation.vendorId } } }))
    ) {
      throw new BadRequestException('Paket tidak ditemukan pada vendor ini');
    }
    if (
      await this.deals.exists({
        where: { planNeedId: need.id, vendorId: conversation.vendorId, status: DealStatus.PENDING },
      })
    ) {
      throw new ConflictException('Sudah ada permintaan yang menunggu respons vendor ini');
    }

    const dealId = await this.dataSource.transaction(async (m) => {
      const deal = await m.save(
        m.create(Deal, {
          conversationId: conversation.id,
          planNeedId: need.id,
          vendorId: conversation.vendorId,
          packageId: dto.packageId ?? null,
          amount: dto.amount,
          eventDate: dto.eventDate,
          status: DealStatus.PENDING,
        }),
      );
      await this.syncNeedStatus(m, need.id);
      return deal.id;
    });
    return this.deals.findOneOrFail({ where: { id: dealId } });
  }

  async findAll(user: AuthUser, query: QueryDealDto) {
    const qb = this.baseQuery()
      .orderBy('d.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);
    await this.scopeToUser(qb, user);
    if (query.status) qb.andWhere('d.status = :status', { status: query.status });
    if (query.planId) qb.andWhere('n.planId = :planId', { planId: query.planId });

    const [rows, total] = await qb.getManyAndCount();
    return paginate(rows, total, query.page, query.limit);
  }

  async findOne(user: AuthUser, id: string) {
    const qb = this.baseQuery().where('d.id = :id', { id });
    await this.scopeToUser(qb, user);
    const deal = await qb.getOne();
    if (!deal) throw new NotFoundException('Kesepakatan tidak ditemukan');
    return deal;
  }

  /** Vendor menyetujui atau menolak permintaan. */
  async respond(userId: string, id: string, dto: RespondDealDto) {
    const vendor = await this.vendorsService.getActiveVendor(userId);
    const deal = await this.deals.findOne({
      where: { id, vendorId: vendor.id },
      relations: { planNeed: { category: true } },
    });
    if (!deal) throw new NotFoundException('Kesepakatan tidak ditemukan');
    if (deal.status !== DealStatus.PENDING) throw new ConflictException('Kesepakatan ini sudah direspons');

    await this.dataSource.transaction(async (m) => {
      await m.update(Deal, deal.id, { status: dto.status, respondedAt: new Date() });

      if (dto.status === DealStatus.ACCEPTED) {
        // permintaan lain untuk kebutuhan yang sama otomatis dibatalkan
        await m.update(
          Deal,
          { planNeedId: deal.planNeedId, status: DealStatus.PENDING, id: Not(deal.id) },
          { status: DealStatus.CANCELLED },
        );
        await m.insert(Schedule, {
          planId: deal.planNeed.planId,
          dealId: deal.id,
          title: `${deal.planNeed.category.name} - ${vendor.storeName}`,
          type: ScheduleType.CUSTOM,
          source: ScheduleSource.DEAL,
          startAt: new Date(`${deal.eventDate}T00:00:00`),
          createdById: userId,
        });
      }

      await m.insert(Message, {
        conversationId: deal.conversationId,
        senderId: userId,
        type: MessageType.SYSTEM,
        content:
          dto.status === DealStatus.ACCEPTED
            ? 'Vendor menyetujui permintaan'
            : `Vendor menolak permintaan${dto.reason ? `: ${dto.reason}` : ''}`,
      });
      await this.syncNeedStatus(m, deal.planNeedId);
    });
    return this.deals.findOneOrFail({ where: { id } });
  }

  /** User membatalkan permintaan yang masih menunggu. */
  async cancel(userId: string, id: string) {
    const deal = await this.deals.findOne({ where: { id }, relations: { planNeed: true } });
    if (!deal) throw new NotFoundException('Kesepakatan tidak ditemukan');
    await this.plansService.assertMember(userId, deal.planNeed.planId);
    if (deal.status !== DealStatus.PENDING) {
      throw new ConflictException('Hanya permintaan yang masih menunggu yang dapat dibatalkan');
    }

    await this.dataSource.transaction(async (m) => {
      await m.update(Deal, id, { status: DealStatus.CANCELLED });
      await this.syncNeedStatus(m, deal.planNeedId);
    });
    return this.deals.findOneOrFail({ where: { id } });
  }

  // ---------------------------------------------------------------- helper

  private baseQuery() {
    return this.deals
      .createQueryBuilder('d')
      .innerJoinAndSelect('d.vendor', 'v')
      .innerJoinAndSelect('d.planNeed', 'n')
      .innerJoinAndSelect('n.category', 'c');
  }

  /** Vendor hanya melihat deal miliknya, user hanya melihat deal dari rencana yang ia ikuti. */
  private async scopeToUser(qb: SelectQueryBuilder<Deal>, user: AuthUser) {
    if (user.role === Role.VENDOR) {
      const vendor = await this.vendorsService.findMine(user.id);
      qb.andWhere('d.vendorId = :vendorId', { vendorId: vendor.id });
    } else {
      qb.innerJoin('n.plan', 'p').innerJoin('p.members', 'me', 'me.userId = :userId', { userId: user.id });
    }
  }

  /** Status kebutuhan mengikuti deal: ada accepted -> disepakati, ada pending -> negosiasi, sisanya belum dipilih. */
  private async syncNeedStatus(m: EntityManager, needId: string) {
    const need = await m.findOneOrFail(PlanNeed, { where: { id: needId } });
    if (need.status === NeedStatus.BUKTI_TERUNGGAH) return; // bukti sudah ada, jangan diturunkan

    const accepted = await m.exists(Deal, { where: { planNeedId: needId, status: DealStatus.ACCEPTED } });
    const pending = await m.exists(Deal, { where: { planNeedId: needId, status: DealStatus.PENDING } });
    need.status = accepted
      ? NeedStatus.DISEPAKATI
      : pending
        ? NeedStatus.NEGOSIASI
        : NeedStatus.BELUM_DIPILIH;
    await m.save(need);
  }
}