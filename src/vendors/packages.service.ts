import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { paginate } from '../common/utils/paginate.js';
import type { CreatePackageDto } from './dto/create-package.dto.js';
import type { UpdatePackageDto } from './dto/update-package.dto.js';
import { PackageItem } from './entities/package-item.entity.js';
import { Package } from './entities/package.entity.js';
import { ServiceItem } from './entities/service-item.entity.js';
import { VendorsService } from './vendors.service.js';

const WITH_ITEMS = { packageItems: { serviceItem: true } } as const;

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package) private readonly packages: Repository<Package>,
    private readonly dataSource: DataSource,
    private readonly vendorsService: VendorsService,
  ) {}

  async list(userId: string, query: PaginationQueryDto) {
    const vendor = await this.vendorsService.findMine(userId);
    const { page, limit } = query;
    const [data, total] = await this.packages.findAndCount({
      where: { vendorId: vendor.id },
      relations: WITH_ITEMS,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async findOne(userId: string, id: string) {
    const vendor = await this.vendorsService.findMine(userId);
    const pkg = await this.packages.findOne({ where: { id, vendorId: vendor.id }, relations: WITH_ITEMS });
    if (!pkg) throw new NotFoundException('Paket tidak ditemukan');
    return pkg;
  }

  async create(userId: string, dto: CreatePackageDto) {
    const vendor = await this.vendorsService.getActiveVendor(userId);
    this.assertGuestRange(dto.minGuests, dto.maxGuests);

    const created = await this.dataSource.transaction(async (manager) => {
      await this.assertOwnedItems(manager, vendor.id, dto.serviceItemIds);
      const { serviceItemIds, ...fields } = dto;
      const pkg = await manager.save(manager.create(Package, { ...fields, vendorId: vendor.id }));
      await manager.insert(
        PackageItem,
        serviceItemIds.map((serviceItemId) => ({ packageId: pkg.id, serviceItemId })),
      );
      return pkg;
    });
    return this.findOne(userId, created.id);
  }

  async update(userId: string, id: string, dto: UpdatePackageDto) {
    const pkg = await this.findOne(userId, id);
    this.assertGuestRange(dto.minGuests ?? pkg.minGuests ?? undefined, dto.maxGuests ?? pkg.maxGuests ?? undefined);

    await this.dataSource.transaction(async (manager) => {
      const { serviceItemIds, ...fields } = dto;
      if (serviceItemIds) {
        await this.assertOwnedItems(manager, pkg.vendorId, serviceItemIds);
        await manager.delete(PackageItem, { packageId: id });
        await manager.insert(
          PackageItem,
          serviceItemIds.map((serviceItemId) => ({ packageId: id, serviceItemId })),
        );
      }
      if (Object.keys(fields).length) await manager.update(Package, { id }, fields);
    });
    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    const pkg = await this.findOne(userId, id);
    await this.packages.softRemove(pkg);
  }

  private assertGuestRange(min?: number, max?: number) {
    if (min !== undefined && max !== undefined && min > max) {
      throw new BadRequestException('minGuests tidak boleh lebih besar dari maxGuests');
    }
  }

  /** Semua item yang dimasukkan ke paket harus milik vendor yang sama dan belum dihapus. */
  private async assertOwnedItems(manager: EntityManager, vendorId: string, ids: string[]) {
    const count = await manager.count(ServiceItem, { where: { id: In(ids), vendorId } });
    if (count !== ids.length) {
      throw new BadRequestException('Sebagian layanan tidak ditemukan atau bukan milik Anda');
    }
  }
}
