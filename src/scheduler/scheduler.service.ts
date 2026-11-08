// scheduler/scheduler.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, ScheduleSource, ScheduleType } from '../common/enums/index.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { PlansService } from '../plans/plans.service.js';
import { VendorsService } from '../vendors/vendors.service.js';
import type { CreateScheduleDto } from './dto/create-schedule.dto.js';
import type { QueryScheduleDto } from './dto/query-schedule.dto.js';
import type { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { Schedule } from './entities/schedule.entity.js';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectRepository(Schedule) private readonly schedules: Repository<Schedule>,
    private readonly plansService: PlansService,
    private readonly vendorsService: VendorsService,
  ) {}

  async create(userId: string, dto: CreateScheduleDto) {
    await this.plansService.assertMember(userId, dto.planId);
    const startAt = new Date(dto.startAt);
    const endAt = dto.endAt ? new Date(dto.endAt) : null;
    this.assertRange(startAt, endAt);

    return this.schedules.save(
      this.schedules.create({
        planId: dto.planId,
        title: dto.title,
        description: dto.description ?? null,
        type: dto.type ?? ScheduleType.CUSTOM,
        source: ScheduleSource.MANUAL,
        startAt,
        endAt,
        remindAt: dto.remindAt ? new Date(dto.remindAt) : null,
        createdById: userId,
      }),
    );
  }

  /** User melihat jadwal dari rencana yang ia ikuti, vendor melihat jadwal dari deal miliknya. */
  async findAll(user: AuthUser, query: QueryScheduleDto) {
    const qb = this.schedules.createQueryBuilder('s').orderBy('s.startAt', 'ASC');

    if (user.role === Role.VENDOR) {
      const vendor = await this.vendorsService.findMine(user.id);
      qb.innerJoin('s.deal', 'd', 'd.vendorId = :vendorId', { vendorId: vendor.id });
    } else {
      qb.innerJoin('s.plan', 'p').innerJoin('p.members', 'me', 'me.userId = :userId', { userId: user.id });
    }

    if (query.planId) qb.andWhere('s.planId = :planId', { planId: query.planId });
    if (query.from) qb.andWhere('s.startAt >= :from', { from: new Date(query.from) });
    if (query.to) {
      // "2027-01-31" tanpa jam berarti sampai akhir hari itu
      const to = query.to.length === 10 ? `${query.to}T23:59:59.999` : query.to;
      qb.andWhere('s.startAt <= :to', { to: new Date(to) });
    }
    return qb.getMany();
  }

  async update(userId: string, id: string, dto: UpdateScheduleDto) {
    const schedule = await this.findOwned(userId, id);
    const { isDone, ...fields } = dto;

    if (schedule.source !== ScheduleSource.MANUAL && Object.values(fields).some((v) => v !== undefined)) {
      throw new ForbiddenException('Jadwal otomatis hanya dapat ditandai selesai');
    }

    const startAt = fields.startAt ? new Date(fields.startAt) : schedule.startAt;
    const endAt = fields.endAt ? new Date(fields.endAt) : schedule.endAt;
    this.assertRange(startAt, endAt);

    Object.assign(schedule, {
      ...fields,
      startAt,
      endAt,
      remindAt: fields.remindAt ? new Date(fields.remindAt) : schedule.remindAt,
    });
    if (isDone !== undefined) schedule.isDone = isDone;
    return this.schedules.save(schedule);
  }

  async remove(userId: string, id: string) {
    const schedule = await this.findOwned(userId, id);
    if (schedule.source !== ScheduleSource.MANUAL) {
      throw new ForbiddenException('Jadwal otomatis tidak dapat dihapus');
    }
    await this.schedules.remove(schedule);
  }

  private async findOwned(userId: string, id: string) {
    const schedule = await this.schedules.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('Jadwal tidak ditemukan');
    await this.plansService.assertMember(userId, schedule.planId);
    return schedule;
  }

  private assertRange(startAt: Date, endAt: Date | null) {
    if (endAt && endAt < startAt) {
      throw new BadRequestException('Waktu selesai tidak boleh sebelum waktu mulai');
    }
  }
}