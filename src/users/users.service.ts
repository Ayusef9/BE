import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Role } from '../common/enums/index.js';
import { isUniqueViolation } from '../common/utils/db-errors.js';
import { paginate } from '../common/utils/paginate.js';
import { comparePassword, hashPassword } from '../common/utils/password.js';
import { publicUrl } from '../common/utils/upload.js';
import { DeviceToken } from './entities/device-token.entity.js';
import { User } from './entities/user.entity.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';
import type { QueryUserDto } from './dto/query-user.dto.js';
import type { RegisterDeviceTokenDto } from './dto/register-device-token.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  phone?: string | null;
  termsAcceptedAt?: Date | null;
}

const calcAge = (birthDate: string | null) => {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(DeviceToken) private readonly devices: Repository<DeviceToken>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  findByEmail(email: string) {
    return this.users.findOne({ where: { email } });
  }

  /** Mengambil juga kolom yang disembunyikan (select:false). Hanya untuk login. */
  findByEmailWithSecrets(email: string) {
    return this.users
      .createQueryBuilder('u')
      .addSelect(['u.passwordHash', 'u.refreshTokenHash'])
      .where('u.email = :email', { email })
      .getOne();
  }

  findByIdWithRefreshHash(id: string) {
    return this.users
      .createQueryBuilder('u')
      .addSelect('u.refreshTokenHash')
      .where('u.id = :id', { id })
      .getOne();
  }

  async create(input: CreateUserInput, manager?: EntityManager): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.users;
    try {
      return await repo.save(repo.create({ ...input, phone: input.phone ?? null }));
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException('Email sudah terdaftar');
      throw err;
    }
  }

  /** Profil untuk layar "Profil Saya", lengkap dengan usia yang dihitung dari tanggal lahir. */
  async getProfile(id: string) {
    const user = await this.findById(id);
    return { ...user, age: calcAge(user.birthDate) };
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.users.save(user);
  }

  async setAvatar(id: string, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('File gambar (jpg, png, webp; maks 5 MB) wajib diunggah');
    await this.users.update({ id }, { avatarUrl: publicUrl('avatars', file) });
    return this.findById(id);
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.users.createQueryBuilder('u').addSelect('u.passwordHash').where('u.id = :id', { id }).getOne();
    if (!user) throw new NotFoundException('User tidak ditemukan');
    if (!(await comparePassword(dto.oldPassword, user.passwordHash))) {
      throw new BadRequestException('Password lama tidak sesuai');
    }
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Konfirmasi password tidak sama dengan password baru');
    }
    // refresh token dihapus supaya perangkat lain harus login ulang
    await this.users.update({ id }, { passwordHash: await hashPassword(dto.newPassword), refreshTokenHash: null });
  }

  // ---- reset password (lupa password)
  async setPasswordReset(id: string, hash: string, expiresAt: Date) {
    await this.users.update({ id }, { passwordResetHash: hash, passwordResetExpiresAt: expiresAt });
  }

  findByResetHash(hash: string) {
    return this.users
      .createQueryBuilder('u')
      .addSelect(['u.passwordResetHash', 'u.passwordResetExpiresAt'])
      .where('u.passwordResetHash = :hash', { hash })
      .getOne();
  }

  async applyPasswordReset(id: string, passwordHash: string) {
    await this.users.update(
      { id },
      { passwordHash, passwordResetHash: null, passwordResetExpiresAt: null, refreshTokenHash: null },
    );
  }

  async setRefreshTokenHash(id: string, hash: string | null) {
    await this.users.update({ id }, { refreshTokenHash: hash });
  }

  async findAll(query: QueryUserDto) {
    const { page, limit, role, search } = query;
    const qb = this.users
      .createQueryBuilder('u')
      .orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (role) qb.andWhere('u.role = :role', { role });
    if (search) qb.andWhere('(u.name ILIKE :s OR u.email ILIKE :s)', { s: `%${search}%` });
    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, page, limit);
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    const user = await this.findById(id);
    user.isActive = isActive;
    if (!isActive) user.refreshTokenHash = null; // paksa logout
    return this.users.save(user);
  }

  async countByRole(): Promise<Record<string, number>> {
    const rows = await this.users
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.role')
      .getRawMany<{ role: string; count: string }>();
    return Object.fromEntries(rows.map((r) => [r.role, Number(r.count)]));
  }

  // ---- device token (FCM)
  async registerDevice(userId: string, dto: RegisterDeviceTokenDto) {
    const existing = await this.devices.findOne({ where: { fcmToken: dto.fcmToken } });
    if (existing) {
      // token yang sama bisa berpindah akun (logout lalu login akun lain di HP yang sama)
      existing.userId = userId;
      existing.platform = dto.platform;
      return this.devices.save(existing);
    }
    return this.devices.save(this.devices.create({ userId, ...dto }));
  }

  async removeDevice(userId: string, fcmToken: string) {
    await this.devices.delete({ userId, fcmToken });
  }
}