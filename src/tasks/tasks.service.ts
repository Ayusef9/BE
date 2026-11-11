// tasks/tasks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlansService } from '../plans/plans.service.js';
import type { CreateTaskDto } from '../tasks/dto/create-task-dto.js';
import type { QueryTaskDto } from '../tasks/dto/query-task.dto.js';
import type { UpdateTaskDto } from '../tasks/dto/update-task-dto.js';
import { Task } from '../tasks/entities/task-entity.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    private readonly plansService: PlansService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    await this.plansService.assertMember(userId, dto.planId);
    return this.tasks.save(
      this.tasks.create({
        planId: dto.planId,
        title: dto.title,
        category: dto.category ?? 'Umum',
        dueDate: dto.dueDate ?? null,
        priority: dto.priority,
      }),
    );
  }

  /** Daftar tugas + jumlah per tab + progres ("12 dari 24 tugas", 50%). */
  async list(userId: string, query: QueryTaskDto) {
    await this.plansService.assertMember(userId, query.planId);

    const raw = await this.tasks
      .createQueryBuilder('t')
      .select('COUNT(*)', 'total')
      .addSelect('COUNT(*) FILTER (WHERE t.is_done = true)', 'done')
      .where('t.planId = :planId', { planId: query.planId })
      .getRawOne<{ total: string; done: string }>();
    const total = Number(raw?.total ?? 0);
    const done = Number(raw?.done ?? 0);

    const qb = this.tasks.createQueryBuilder('t').where('t.planId = :planId', { planId: query.planId });
    if (query.status === 'open') qb.andWhere('t.isDone = false');
    if (query.status === 'done') qb.andWhere('t.isDone = true');

    qb.orderBy('t.isDone', 'ASC'); // yang sudah selesai selalu di bawah
    if (query.sort === 'priority') {
      qb.addOrderBy("CASE t.priority WHEN 'very_important' THEN 0 WHEN 'important' THEN 1 ELSE 2 END", 'ASC');
    }
    qb.addOrderBy('t.dueDate', 'ASC', 'NULLS LAST').addOrderBy('t.createdAt', 'ASC');

    return {
      progress: { total, done, percent: total ? Math.round((done / total) * 100) : 0 },
      counts: { all: total, open: total - done, done },
      items: await qb.getMany(),
    };
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.findOwned(userId, id);
    const { isDone, ...fields } = dto;
    Object.assign(task, fields);
    if (isDone !== undefined && isDone !== task.isDone) {
      task.isDone = isDone;
      task.completedAt = isDone ? new Date() : null;
    }
    return this.tasks.save(task);
  }

  async remove(userId: string, id: string) {
    await this.tasks.remove(await this.findOwned(userId, id));
  }

  private async findOwned(userId: string, id: string) {
    const task = await this.tasks.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Tugas tidak ditemukan');
    await this.plansService.assertMember(userId, task.planId);
    return task;
  }
}