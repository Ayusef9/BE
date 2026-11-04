import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { paginate } from '../common/utils/paginate.js';
import type { CreateServiceItemDto } from './dto/create-service-item.dto.js';
import type { QueryServiceItemDto } from './dto/query-service-item.dto.js';
import type { UpdateServiceItemDto } from './dto/update-service-item.dto.js';
import { PackageItem } from './entities/package-item.entity.js';
import { ServiceCategory } from './entities/service-category.entity.js';
import { ServiceItem } from './entities/service-item.entity.js';
import { VendorsService } from './vendors.service.js';

@Injectable()
export class ServiceItemsService {
  constructor(
    @InjectRepository(ServiceItem) private readonly items: Repository<ServiceItem>,
    @InjectRepository(ServiceCategory) private readonly categories: Repository<ServiceCategory>,
    private readonly dataSource: DataSource,
    private readonly vendorsService: VendorsService,
  ) {}

  async list(userId: string, query: QueryServiceItemDto) {
    const vendor = await this.vendorsService.findMine(userId);
    const { page, limit, categoryId } = query;
    const [data, total] = await this.items.findAndCount({
      where: { vendorId: vendor.id, ...(categoryId ? { categoryId } : {}) },
      relations: { category: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async create(userId: string, dto: CreateServiceItemDto) {
    const vendor = await this.vendorsService.getActiveVendor(userId);
    await this.assertCategory(dto.categoryId);
    return this.items.save(this.items.create({ ...dto, vendorId: vendor.id }));
  }

  async update(userId: string, id: string, dto: UpdateServiceItemDto) {
    const item = await this.findOwned(userId, id);
    if (dto.categoryId) await this.assertCategory(dto.categoryId);
    Object.assign(item, dto);
    return this.items.save(item);
  }

  /** Soft delete. Item juga dilepas dari semua paket agar paket tidak menampilkan item yang sudah dihapus. */
  async remove(userId: string, id: string) {
    const item = await this.findOwned(userId, id);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(PackageItem, { serviceItemId: id });
      await manager.softRemove(item);
    });
  }

  private async findOwned(userId: string, id: string) {
    const vendor = await this.vendorsService.findMine(userId);
    const item = await this.items.findOne({ where: { id, vendorId: vendor.id } });
    if (!item) throw new NotFoundException('Layanan tidak ditemukan');
    return item;
  }

  private async assertCategory(categoryId: string) {
    if (!(await this.categories.exists({ where: { id: categoryId } }))) {
      throw new BadRequestException('Kategori tidak ditemukan');
    }
  }
}
