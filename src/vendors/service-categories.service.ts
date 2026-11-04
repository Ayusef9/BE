import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isForeignKeyViolation, isUniqueViolation } from '../common/utils/db-errors.js';
import type { CreateServiceCategoryDto, UpdateServiceCategoryDto } from './dto/service-category.dto.js';
import { ServiceCategory } from './entities/service-category.entity.js';

@Injectable()
export class ServiceCategoriesService {
  constructor(@InjectRepository(ServiceCategory) private readonly categories: Repository<ServiceCategory>) {}

  findAll() {
    return this.categories.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async findOne(id: string) {
    const category = await this.categories.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');
    return category;
  }

  async create(dto: CreateServiceCategoryDto) {
    try {
      return await this.categories.save(this.categories.create(dto));
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException('Nama kategori sudah ada');
      throw err;
    }
  }

  async update(id: string, dto: UpdateServiceCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    try {
      return await this.categories.save(category);
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException('Nama kategori sudah ada');
      throw err;
    }
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    try {
      await this.categories.remove(category);
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw new ConflictException('Kategori masih dipakai oleh layanan atau rencana, tidak bisa dihapus');
      }
      throw err;
    }
  }
}
