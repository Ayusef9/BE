import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DealStatus, MemberRole, NeedStatus, Role } from '../common/enums/index.js';
import { isUniqueViolation } from '../common/utils/db-errors.js';
import { Deal } from '../deals/entities/deal.entity.js';
import { UsersService } from '../users/users.service.js';
import { ServiceCategory } from '../vendors/entities/service-category.entity.js';
import type { AddPlanMemberDto } from './dto/add-plan-member.dto.js';
import type { CreatePlanDto } from './dto/create-plan.dto.js';
import type { CreatePlanNeedDto } from './dto/create-plan-need.dto.js';
import type { UpdatePlanDto } from './dto/update-plan.dto.js';
import type { UpdatePlanNeedDto } from './dto/update-plan-need.dto.js';
import { PlanMember } from './entities/plan-member.entity.js';
import { PlanNeed } from './entities/plan-need.entity.js';
import { WeddingPlan } from './entities/wedding-plan.entity.js';

const MAX_MEMBERS = 2; // satu rencana dikelola sepasang calon pengantin

/** Tanggal hari ini (YYYY-MM-DD) menurut WIB, supaya "hari ini" tidak bergeser di server UTC. */
const todayJakarta = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

/** Tahapan persiapan, dihitung mundur dari hari H. `category` cocok dengan nama kategori hasil seed. */
const MILESTONES = [
  { daysBefore: 365, title: 'Tentukan budget, konsep, dan perkiraan jumlah tamu', category: null },
  { daysBefore: 300, title: 'Survei dan pesan venue', category: 'Venue' },
  { daysBefore: 240, title: 'Pilih katering dan dekorasi', category: 'Katering' },
  { daysBefore: 180, title: 'Pilih dokumentasi serta rias dan busana', category: 'Dokumentasi' },
  { daysBefore: 120, title: 'Pesan undangan dan suvenir', category: 'Undangan & Suvenir' },
  { daysBefore: 90, title: 'Siapkan berkas administrasi pernikahan', category: null },
  { daysBefore: 60, title: 'Tasting katering dan fitting busana', category: null },
  { daysBefore: 30, title: 'Konfirmasi final seluruh vendor dan sebar undangan', category: null },
  { daysBefore: 14, title: 'Gladi dan konfirmasi jumlah tamu', category: null },
  { daysBefore: 7, title: 'Cek ulang perlengkapan dan jadwal', category: null },
  { daysBefore: 1, title: 'Persiapan akhir', category: null },
  { daysBefore: 0, title: 'Hari H', category: null },
];

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(WeddingPlan) private readonly plans: Repository<WeddingPlan>,
    @InjectRepository(PlanMember) private readonly members: Repository<PlanMember>,
    @InjectRepository(PlanNeed) private readonly needs: Repository<PlanNeed>,
    @InjectRepository(ServiceCategory) private readonly categories: Repository<ServiceCategory>,
    @InjectRepository(Deal) private readonly deals: Repository<Deal>,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------------------------------------------- akses

  /** Memastikan user adalah anggota rencana. Mengembalikan rencananya. 404 (bukan 403) agar keberadaan rencana orang lain tidak bocor. */
  async assertMember(userId: string, planId: string): Promise<WeddingPlan> {
    const plan = await this.plans.findOne({ where: { id: planId } });
    if (!plan || !(await this.members.exists({ where: { planId, userId } }))) {
      throw new NotFoundException('Rencana tidak ditemukan');
    }
    return plan;
  }

  async assertOwner(userId: string, planId: string): Promise<WeddingPlan> {
    const plan = await this.assertMember(userId, planId);
    const owner = await this.members.exists({ where: { planId, userId, memberRole: MemberRole.OWNER } });
    if (!owner) throw new ForbiddenException('Hanya pemilik rencana yang dapat melakukan ini');
    return plan;
  }

  // ---------------------------------------------------------------- rencana

  /** Membuat rencana, menjadikan pembuatnya owner, dan menyiapkan daftar kebutuhan dari semua kategori. */
  async create(userId: string, dto: CreatePlanDto) {
    this.assertFutureDate(dto.weddingDate);

    const planId = await this.dataSource.transaction(async (manager) => {
      const plan = await manager.save(manager.create(WeddingPlan, { ...dto, totalBudget: dto.totalBudget ?? 0 }));
      await manager.insert(PlanMember, { planId: plan.id, userId, memberRole: MemberRole.OWNER });

      const categories = await manager.find(ServiceCategory);
      if (categories.length) {
        await manager.insert(
          PlanNeed,
          categories.map((c) => ({ planId: plan.id, categoryId: c.id, status: NeedStatus.BELUM_DIPILIH })),
        );
      }
      return plan.id;
    });
    return this.findOne(userId, planId);
  }

  findMine(userId: string) {
    return this.plans
      .createQueryBuilder('p')
      .innerJoin('p.members', 'me', 'me.userId = :userId', { userId })
      .orderBy('p.createdAt', 'DESC')
      .getMany();
  }

  async findOne(userId: string, planId: string) {
    await this.assertMember(userId, planId);
    const plan = await this.plans.findOneOrFail({
      where: { id: planId },
      relations: { members: { user: true } },
    });
    
    return {
      ...plan,
      members: plan.members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        memberRole: m.memberRole,
      })),
    };
  }

  async update(userId: string, planId: string, dto: UpdatePlanDto) {
    const plan = await this.assertMember(userId, planId);
    this.assertFutureDate(dto.weddingDate);
    Object.assign(plan, dto);
    await this.plans.save(plan);
    return this.findOne(userId, planId);
  }

  async remove(userId: string, planId: string) {
    const plan = await this.assertOwner(userId, planId);
    await this.plans.softRemove(plan);
  }

  // ---------------------------------------------------------------- pasangan

  async addMember(userId: string, planId: string, dto: AddPlanMemberDto) {
    await this.assertOwner(userId, planId);

    const target = await this.usersService.findByEmail(dto.email);
    if (!target || target.role !== Role.USER) {
      throw new NotFoundException('Pengguna dengan email itu tidak ditemukan');
    }
    if (await this.members.exists({ where: { planId, userId: target.id } })) {
      throw new ConflictException('Pengguna ini sudah menjadi anggota rencana');
    }
    if ((await this.members.count({ where: { planId } })) >= MAX_MEMBERS) {
      throw new ConflictException('Rencana ini sudah memiliki dua anggota');
    }

    await this.members.insert({ planId, userId: target.id, memberRole: MemberRole.PARTNER });
    return this.findOne(userId, planId);
  }

  // ---------------------------------------------------------------- budget

  async getBudgetSummary(userId: string, planId: string) {
    const plan = await this.assertMember(userId, planId);
    return this.computeBudget(plan);
  }

  /**
   * Ringkasan budget TIDAK disimpan di tabel, selalu dihitung dari deals.
   * Hanya deal `accepted` yang mengurangi budget. `pending` hanya informasi.
   */
  async computeBudget(plan: WeddingPlan) {
    const rows = await this.deals
      .createQueryBuilder('d')
      .innerJoin('d.planNeed', 'n')
      .select('d.status', 'status')
      .addSelect('COALESCE(SUM(d.amount), 0)', 'total')
      .where('n.planId = :planId', { planId: plan.id })
      .groupBy('d.status')
      .getRawMany<{ status: string; total: string }>();

    const sum = (status: DealStatus) => Number(rows.find((r) => r.status === status)?.total ?? 0);
    const round = (n: number) => Math.round(n * 100) / 100;

    const committed = sum(DealStatus.ACCEPTED);
    return {
      totalBudget: plan.totalBudget,
      committed: round(committed),
      pending: round(sum(DealStatus.PENDING)),
      remaining: round(plan.totalBudget - committed),
      overBudget: committed > plan.totalBudget,
    };
  }

  // ---------------------------------------------------------------- timeline

  async getTimeline(userId: string, planId: string) {
    const plan = await this.assertMember(userId, planId);
    if (!plan.weddingDate) {
      throw new BadRequestException('Isi tanggal pernikahan terlebih dahulu untuk membuat timeline');
    }
    const today = todayJakarta();
    const base = new Date(`${plan.weddingDate}T00:00:00Z`).getTime();

    return MILESTONES.map((m) => {
      const date = new Date(base - m.daysBefore * 86_400_000).toISOString().slice(0, 10);
      return { ...m, date, isPast: date < today };
    });
  }

  // ---------------------------------------------------------------- kebutuhan acara

  async listNeeds(userId: string, planId: string) {
    await this.assertMember(userId, planId);
    return this.needs.find({
      where: { planId },
      relations: { category: true },
      order: { category: { sortOrder: 'ASC' } },
    });
  }

  async addNeed(userId: string, planId: string, dto: CreatePlanNeedDto) {
    await this.assertMember(userId, planId);
    if (!(await this.categories.exists({ where: { id: dto.categoryId } }))) {
      throw new BadRequestException('Kategori tidak ditemukan');
    }
    try {
      return await this.needs.save(
        this.needs.create({ planId, categoryId: dto.categoryId, notes: dto.notes ?? null, status: NeedStatus.BELUM_DIPILIH }),
      );
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException('Kategori ini sudah ada di rencana');
      throw err;
    }
  }

  async updateNeed(userId: string, planId: string, needId: string, dto: UpdatePlanNeedDto) {
    await this.assertMember(userId, planId);
    const need = await this.findNeed(planId, needId);

    if (dto.status !== undefined && dto.status !== need.status) {
      // disepakati dan bukti_terunggah ditentukan sistem (dari deal dan bukti), bukan diisi manual
      if (dto.status !== NeedStatus.BELUM_DIPILIH && dto.status !== NeedStatus.NEGOSIASI) {
        throw new BadRequestException('Status disepakati dan bukti_terunggah diatur otomatis oleh sistem');
      }
      if (need.status === NeedStatus.DISEPAKATI || need.status === NeedStatus.BUKTI_TERUNGGAH) {
        throw new ConflictException('Kebutuhan ini sudah disepakati dengan vendor, statusnya tidak bisa diubah manual');
      }
      need.status = dto.status;
    }
    if (dto.notes !== undefined) need.notes = dto.notes;
    return this.needs.save(need);
  }

  async removeNeed(userId: string, planId: string, needId: string) {
    await this.assertMember(userId, planId);
    const need = await this.findNeed(planId, needId);
    if (await this.deals.exists({ where: { planNeedId: need.id } })) {
      throw new ConflictException('Kebutuhan ini sudah memiliki kesepakatan dengan vendor, tidak bisa dihapus');
    }
    await this.needs.remove(need);
  }

  private async findNeed(planId: string, needId: string) {
    const need = await this.needs.findOne({ where: { id: needId, planId } });
    if (!need) throw new NotFoundException('Kebutuhan tidak ditemukan');
    return need;
  }

  private assertFutureDate(date?: string) {
    if (date && date < todayJakarta()) {
      throw new BadRequestException('Tanggal pernikahan tidak boleh di masa lalu');
    }
  }
}
