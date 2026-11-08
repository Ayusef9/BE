import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { rm } from 'node:fs/promises';
import { DataSource, Repository } from 'typeorm';
import { NeedStatus } from '../common/enums/index.js';
import { Deal } from '../deals/entities/deal.entity.js';
import { PlanNeed } from '../plans/entities/plan-need.entity.js';
import { PlansService } from '../plans/plans.service.js';
import type { ConfirmReceiptDto } from './dto/confirm-receipt.dto.js';
import type { CreateDocumentTaskDto } from './dto/create-document-task.dto.js';
import type { UpdateDocumentTaskDto } from './dto/update-document-task.dto.js';
import type { UploadReceiptDto } from './dto/upload-receipt.dto.js';
import { DocumentTask } from './entities/document-task.entity.js';
import { Receipt } from './entities/receipt.entity.js';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentTask) private readonly tasks: Repository<DocumentTask>,
    @InjectRepository(Receipt) private readonly receipts: Repository<Receipt>,
    @InjectRepository(PlanNeed) private readonly needs: Repository<PlanNeed>,
    @InjectRepository(Deal) private readonly deals: Repository<Deal>,
    private readonly plansService: PlansService,
    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------------------------------------------- checklist berkas

  async createTask(userId: string, dto: CreateDocumentTaskDto) {
    await this.plansService.assertMember(userId, dto.planId);
    return this.tasks.save(
      this.tasks.create({
        planId: dto.planId,
        title: dto.title,
        description: dto.description ?? null,
        dueDate: dto.dueDate ?? null,
      }),
    );
  }

  async listTasks(userId: string, planId: string) {
    await this.plansService.assertMember(userId, planId);
    return this.tasks.find({ where: { planId }, order: { isDone: 'ASC', dueDate: 'ASC' } });
  }

  async updateTask(userId: string, id: string, dto: UpdateDocumentTaskDto) {
    const task = await this.findTask(userId, id);
    const { isDone, ...fields } = dto;
    Object.assign(task, fields);
    if (isDone !== undefined && isDone !== task.isDone) {
      task.isDone = isDone;
      task.completedAt = isDone ? new Date() : null;
    }
    return this.tasks.save(task);
  }

  async removeTask(userId: string, id: string) {
    await this.tasks.remove(await this.findTask(userId, id));
  }

  private async findTask(userId: string, id: string) {
    const task = await this.tasks.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Tugas berkas tidak ditemukan');
    await this.plansService.assertMember(userId, task.planId);
    return task;
  }

  // ---------------------------------------------------------------- bukti transaksi

  async uploadReceipt(userId: string, dto: UploadReceiptDto, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('File gambar (jpg, png, webp; maks 5 MB) wajib diunggah');

    try {
      const need = await this.needs.findOne({ where: { id: dto.planNeedId } });
      if (!need) throw new NotFoundException('Kebutuhan tidak ditemukan');
      await this.plansService.assertMember(userId, need.planId);

      if (dto.dealId && !(await this.deals.exists({ where: { id: dto.dealId, planNeedId: need.id } }))) {
        throw new BadRequestException('Kesepakatan tidak cocok dengan kebutuhan ini');
      }
      // OCR belum dihubungkan: kolom ocr_* dibiarkan kosong, user mengisi manual lewat /confirm
      return await this.receipts.save(
        this.receipts.create({
          planNeedId: need.id,
          dealId: dto.dealId ?? null,
          uploadedById: userId,
          imagePath: file.path,
        }),
      );
    } catch (err) {
      await rm(file.path, { force: true }); // jangan tinggalkan file yatim
      throw err;
    }
  }

  async listReceipts(userId: string, planId: string) {
    await this.plansService.assertMember(userId, planId);
    return this.receipts
      .createQueryBuilder('r')
      .innerJoin('r.planNeed', 'n')
      .where('n.planId = :planId', { planId })
      .orderBy('r.createdAt', 'DESC')
      .getMany();
  }

  /** User mengoreksi hasil bacaan lalu mengonfirmasi. Jika kebutuhan sudah disepakati, statusnya naik jadi bukti_terunggah. */
  async confirmReceipt(userId: string, id: string, dto: ConfirmReceiptDto) {
    const receipt = await this.receipts.findOne({ where: { id }, relations: { planNeed: true } });
    if (!receipt) throw new NotFoundException('Bukti transaksi tidak ditemukan');
    await this.plansService.assertMember(userId, receipt.planNeed.planId);
    if (receipt.isConfirmed) throw new ConflictException('Bukti transaksi sudah dikonfirmasi');

    await this.dataSource.transaction(async (m) => {
      await m.update(Receipt, id, {
        amount: dto.amount,
        transactionDate: dto.transactionDate,
        recipientName: dto.recipientName,
        isConfirmed: true,
      });
      if (receipt.planNeed.status === NeedStatus.DISEPAKATI) {
        await m.update(PlanNeed, receipt.planNeed.id, { status: NeedStatus.BUKTI_TERUNGGAH });
      }
    });
    return this.receipts.findOneOrFail({ where: { id } });
  }
}