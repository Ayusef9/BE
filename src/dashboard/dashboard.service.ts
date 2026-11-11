import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlansService } from '../plans/plans.service.js';
import { Schedule } from '../scheduler/entities/schedule.entity.js';
import { Task } from '../tasks/entities/task-entity.js';
import type { QueryCalendarDto, QueryDayDto } from './dto/query-calendar.dto.js';

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const nextMonthStart = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
};

const encouragement = (percent: number) =>
  percent >= 100
    ? 'Semua tugas selesai. Selamat!'
    : percent >= 75
      ? 'Tinggal sedikit lagi. Terus semangat!'
      : percent >= 50
        ? 'Setengah perjalanan terlewati. Kamu hebat!'
        : percent >= 25
          ? 'Langkah awalmu sudah bagus. Lanjutkan!'
          : 'Mulai dari satu tugas kecil hari ini.';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(Schedule) private readonly schedules: Repository<Schedule>,
    private readonly plansService: PlansService,
  ) {}

  /** Beranda dan kartu "Hari Bahagia": hitung mundur, progres tugas, dan tugas terdekat. */
  async summary(userId: string, planId: string) {
    const plan = await this.plansService.assertMember(userId, planId);
    const raw = await this.tasks
      .createQueryBuilder('t')
      .select('COUNT(*)', 'total')
      .addSelect('COUNT(*) FILTER (WHERE t.is_done = true)', 'done')
      .where('t.planId = :planId', { planId })
      .getRawOne<{ total: string; done: string }>();
    const total = Number(raw?.total ?? 0);
    const done = Number(raw?.done ?? 0);
    const percent = total ? Math.round((done / total) * 100) : 0;

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const daysLeft = plan.weddingDate
      ? Math.round((Date.parse(`${plan.weddingDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000)
      : null;

    return {
      plan: { id: plan.id, title: plan.title, weddingDate: plan.weddingDate, city: plan.city, daysLeft },
      tasks: { total, done, percent },
      message: encouragement(percent),
      upcomingTasks: await this.tasks.find({
        where: { planId, isDone: false },
        order: { dueDate: 'ASC', createdAt: 'ASC' },
        take: 3,
      }),
    };
  }

  /** Jumlah acara dan tugas per hari dalam satu bulan, untuk titik-titik di kalender. */
  async calendar(userId: string, query: QueryCalendarDto) {
    await this.plansService.assertMember(userId, query.planId);
    const from = `${query.month}-01`;
    const to = nextMonthStart(query.month);

    const scheduleRows = await this.schedules
      .createQueryBuilder('s')
      .select("to_char(s.start_at, 'YYYY-MM-DD')", 'day')
      .addSelect('COUNT(*)', 'count')
      .where('s.planId = :planId', { planId: query.planId })
      .andWhere('s.startAt >= :from AND s.startAt < :to', { from, to })
      .groupBy('day')
      .getRawMany<{ day: string; count: string }>();

    const taskRows = await this.tasks
      .createQueryBuilder('t')
      .select("to_char(t.due_date, 'YYYY-MM-DD')", 'day')
      .addSelect('COUNT(*)', 'count')
      .where('t.planId = :planId', { planId: query.planId })
      .andWhere('t.dueDate >= :from AND t.dueDate < :to', { from, to })
      .groupBy('day')
      .getRawMany<{ day: string; count: string }>();

    const days = new Map<string, { date: string; scheduleCount: number; taskCount: number }>();
    const slot = (date: string) => {
      if (!days.has(date)) days.set(date, { date, scheduleCount: 0, taskCount: 0 });
      return days.get(date)!;
    };
    for (const r of scheduleRows) slot(r.day).scheduleCount = Number(r.count);
    for (const r of taskRows) slot(r.day).taskCount = Number(r.count);
    return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  /** Isi satu hari saat tanggal di kalender diketuk. */
  async day(userId: string, query: QueryDayDto) {
    await this.plansService.assertMember(userId, query.planId);
    const next = addDays(query.date, 1);
    return {
      date: query.date,
      schedules: await this.schedules
        .createQueryBuilder('s')
        .where('s.planId = :planId', { planId: query.planId })
        .andWhere('s.startAt >= :date AND s.startAt < :next', { date: query.date, next })
        .orderBy('s.startAt', 'ASC')
        .getMany(),
      tasks: await this.tasks.find({
        where: { planId: query.planId, dueDate: query.date },
        order: { isDone: 'ASC', createdAt: 'ASC' },
      }),
    };
  }
}