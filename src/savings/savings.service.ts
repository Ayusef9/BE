// savings/savings.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlansService } from '../plans/plans.service.js';
import type { CreateContributionDto } from './dto/create-contribution.dto.js';
import type { CreateSavingsGoalDto } from './dto/create-savings-goal.dto.js';
import type { CreateSavingsNoteDto } from './dto/create-savings-note.dto.js';
import type { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto.js';
import { SavingsContribution } from './entities/savings-contribution.entity.js';
import { SavingsGoal } from './entities/savings-goal.entity.js';
import { SavingsNote } from './entities/savings-note.entity.js';

const round = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class SavingsService {
  constructor(
    @InjectRepository(SavingsGoal) private readonly goals: Repository<SavingsGoal>,
    @InjectRepository(SavingsContribution) private readonly contributions: Repository<SavingsContribution>,
    @InjectRepository(SavingsNote) private readonly notes: Repository<SavingsNote>,
    private readonly plansService: PlansService,
  ) {}

  async createGoal(userId: string, dto: CreateSavingsGoalDto) {
    const plan = await this.plansService.assertMember(userId, dto.planId);
    const useTotalBudget = dto.useTotalBudget ?? false;
    if (!useTotalBudget && dto.targetAmount === undefined) {
      throw new BadRequestException('Target tabungan wajib diisi jika tidak mengikuti total anggaran');
    }

    const goal = await this.goals.save(
      this.goals.create({
        planId: plan.id,
        title: dto.title,
        useTotalBudget,
        targetAmount: useTotalBudget ? plan.totalBudget : (dto.targetAmount ?? 0),
      }),
    );
    return this.summarize(goal, plan.totalBudget, 0);
  }

  async listGoals(userId: string, planId: string) {
    const plan = await this.plansService.assertMember(userId, planId);
    const goals = await this.goals.find({ where: { planId }, order: { createdAt: 'ASC' } });

    const rows = await this.contributions
      .createQueryBuilder('c')
      .innerJoin('c.goal', 'g')
      .select('c.goalId', 'goalId')
      .addSelect('COALESCE(SUM(c.amount), 0)', 'total')
      .where('g.planId = :planId', { planId })
      .groupBy('c.goalId')
      .getRawMany<{ goalId: string; total: string }>();
    const saved = new Map(rows.map((r) => [r.goalId, round(Number(r.total))]));

    return goals.map((g) => this.summarize(g, plan.totalBudget, saved.get(g.id) ?? 0));
  }

  async getGoal(userId: string, goalId: string) {
    const { goal, plan } = await this.loadGoal(userId, goalId);
    const contributions = await this.contributions.find({
      where: { goalId },
      relations: { user: true },
      order: { contributedAt: 'DESC', createdAt: 'DESC' },
    });
    const notes = await this.notes.find({
      where: { goalId },
      relations: { author: true },
      order: { createdAt: 'DESC' },
    });
    const saved = round(contributions.reduce((sum, c) => sum + c.amount, 0));

    return {
      ...this.summarize(goal, plan.totalBudget, saved),
      contributions: contributions.map((c) => ({ ...c, user: { id: c.user.id, name: c.user.name } })),
      notes: notes.map((n) => ({ ...n, author: { id: n.author.id, name: n.author.name } })),
    };
  }

  async updateGoal(userId: string, goalId: string, dto: UpdateSavingsGoalDto) {
    const { goal, plan } = await this.loadGoal(userId, goalId);
    if (dto.title !== undefined) goal.title = dto.title;
    if (dto.useTotalBudget !== undefined) goal.useTotalBudget = dto.useTotalBudget;
    if (dto.targetAmount !== undefined) goal.targetAmount = dto.targetAmount;
    if (goal.useTotalBudget) goal.targetAmount = plan.totalBudget;

    await this.goals.save(goal);
    return this.summarize(goal, plan.totalBudget, await this.sumContributions(goal.id));
  }

  async removeGoal(userId: string, goalId: string) {
    const { goal } = await this.loadGoal(userId, goalId);
    await this.goals.remove(goal); // kontribusi dan notulen ikut terhapus (CASCADE)
  }

  async addContribution(userId: string, goalId: string, dto: CreateContributionDto) {
    await this.loadGoal(userId, goalId);
    return this.contributions.save(
      this.contributions.create({
        goalId,
        userId,
        amount: dto.amount,
        contributedAt: dto.contributedAt,
        description: dto.description ?? null,
      }),
    );
  }

  async removeContribution(userId: string, goalId: string, contributionId: string) {
    await this.loadGoal(userId, goalId);
    const contribution = await this.contributions.findOne({ where: { id: contributionId, goalId } });
    if (!contribution) throw new NotFoundException('Kontribusi tidak ditemukan');
    if (contribution.userId !== userId) {
      throw new ForbiddenException('Hanya pencatat kontribusi yang dapat menghapusnya');
    }
    await this.contributions.remove(contribution);
  }

  async addNote(userId: string, goalId: string, dto: CreateSavingsNoteDto) {
    await this.loadGoal(userId, goalId);
    return this.notes.save(this.notes.create({ goalId, authorId: userId, content: dto.content }));
  }

  // ---------------------------------------------------------------- helper

  private async loadGoal(userId: string, goalId: string) {
    const goal = await this.goals.findOne({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Target tabungan tidak ditemukan');
    const plan = await this.plansService.assertMember(userId, goal.planId);
    return { goal, plan };
  }

  private async sumContributions(goalId: string) {
    const row = await this.contributions
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.amount), 0)', 'total')
      .where('c.goalId = :goalId', { goalId })
      .getRawOne<{ total: string }>();
    return round(Number(row?.total ?? 0));
  }

  /** Jika useTotalBudget aktif, target selalu mengikuti total budget rencana saat ini. */
  private summarize(goal: SavingsGoal, planBudget: number, saved: number) {
    const target = goal.useTotalBudget ? planBudget : goal.targetAmount;
    return {
      ...goal,
      targetAmount: target,
      saved,
      remaining: Math.max(round(target - saved), 0),
      progress: target > 0 ? Math.min(Math.round((saved / target) * 100), 100) : 0,
    };
  }
}