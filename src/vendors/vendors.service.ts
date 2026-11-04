import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service.js';
import { Role, VerificationStatus } from '../common/enums/index.js';
import { paginate } from '../common/utils/paginate.js';
import { hashPassword } from '../common/utils/password.js';
import { UsersService } from '../users/users.service.js';
import type { QueryVendorDto } from './dto/query-vendor.dto.js';
import type { RegisterVendorDto } from './dto/register-vendor.dto.js';
import type { UpdateVendorDto } from './dto/update-vendor.dto.js';
import type { VerifyVendorDto } from './dto/verify-vendor.dto.js';
import { Vendor } from './entities/vendor.entity.js';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor) private readonly vendors: Repository<Vendor>,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  /** Mitra mendaftar: membuat akun (role vendor) + profil toko berstatus pending, dalam satu transaksi. */
  async register(dto: RegisterVendorDto) {
    const passwordHash = await hashPassword(dto.password);

    const { user, vendor } = await this.dataSource.transaction(async (manager) => {
      const user = await this.usersService.create(
        { name: dto.name, email: dto.email, phone: dto.phone, passwordHash, role: Role.VENDOR },
        manager,
      );
      const vendor = await manager.save(
        manager.create(Vendor, {
          userId: user.id,
          storeName: dto.storeName,
          description: dto.description ?? null,
          phone: dto.phone,
          address: dto.address,
          city: dto.city,
          verificationStatus: VerificationStatus.PENDING,
        }),
      );
      return { user, vendor };
    });

    const auth = await this.authService.issueTokens(user);
    return { ...auth, vendor };
  }

  async findMine(userId: string): Promise<Vendor> {
    const vendor = await this.vendors.findOne({ where: { userId } });
    if (!vendor) throw new NotFoundException('Profil mitra tidak ditemukan');
    return vendor;
  }

  /** Dipakai sebelum vendor mengelola layanan/paket: hanya vendor yang sudah diverifikasi. */
  async getActiveVendor(userId: string): Promise<Vendor> {
    const vendor = await this.findMine(userId);
    if (vendor.verificationStatus !== VerificationStatus.ACTIVE) {
      throw new ForbiddenException('Akun mitra belum diverifikasi admin');
    }
    return vendor;
  }

  async updateMine(userId: string, dto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findMine(userId);
    Object.assign(vendor, dto);
    return this.vendors.save(vendor);
  }

  // ---------- sisi admin
  async findAll(query: QueryVendorDto) {
    const { page, limit, status, search } = query;
    const qb = this.vendors
      .createQueryBuilder('v')
      .leftJoin('v.user', 'u')
      .addSelect(['u.id', 'u.name', 'u.email'])
      .orderBy('v.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (status) qb.andWhere('v.verificationStatus = :status', { status });
    if (search) {
      qb.andWhere('(v.storeName ILIKE :s OR v.city ILIKE :s OR u.email ILIKE :s)', { s: `%${search}%` });
    }
    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, page, limit);
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendors.findOne({ where: { id }, relations: { user: true } });
    if (!vendor) throw new NotFoundException('Mitra tidak ditemukan');
    return vendor;
  }

  async verify(id: string, adminId: string, dto: VerifyVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id);
    if (vendor.verificationStatus === dto.status) {
      throw new ConflictException(`Mitra sudah berstatus ${dto.status}`);
    }
    vendor.verificationStatus = dto.status;
    vendor.rejectionReason = dto.status === VerificationStatus.REJECTED ? (dto.rejectionReason ?? null) : null;
    vendor.verifiedAt = new Date();
    vendor.verifiedById = adminId;
    return this.vendors.save(vendor);
  }

  async countByStatus(): Promise<Record<string, number>> {
    const rows = await this.vendors
      .createQueryBuilder('v')
      .select('v.verificationStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('v.verificationStatus')
      .getRawMany<{ status: string; count: string }>();
    return Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));
  }
}
