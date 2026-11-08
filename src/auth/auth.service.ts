import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { Role } from '../common/enums/index.js';
import type { JwtPayload } from '../common/types/auth-user.js';
import { comparePassword, hashPassword } from '../common/utils/password.js';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

export interface AuthResult {
  user: { id: string; name: string; email: string; role: Role };
  accessToken: string;
  refreshToken: string;
}

// Hash palsu agar waktu respons login tetap mirip walau email tidak ada
// (mencegah penyerang menebak email mana yang terdaftar dari lama responsnya).
const DUMMY_HASH = '$2b$10$ynxD5s6myAXJtuUAG6wDpOhtFE3leSwLYQ4QDwcHHXLglA9OhtnDe';

/** Refresh token disimpan sebagai SHA-256 (bukan bcrypt, karena bcrypt hanya membaca 72 byte pertama). */
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
      role: Role.USER, // register publik selalu role user; vendor lewat /vendors/register
    });
    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmailWithSecrets(dto.email);
    const valid = await comparePassword(dto.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) throw new UnauthorizedException('Email atau password salah');
    if (!user.isActive) throw new ForbiddenException('Akun dinonaktifkan');
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid atau kedaluwarsa');
    }

    const user = await this.usersService.findByIdWithRefreshHash(payload.sub);
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException('Sesi tidak valid, silakan login ulang');
    }

    const a = Buffer.from(user.refreshTokenHash);
    const b = Buffer.from(sha256(refreshToken));
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      // Token bertanda tangan valid tapi bukan yang terbaru: kemungkinan token lama dipakai ulang.
      await this.usersService.setRefreshTokenHash(user.id, null);
      throw new UnauthorizedException('Sesi tidak valid, silakan login ulang');
    }
    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.usersService.setRefreshTokenHash(userId, null);
  }

  /** Membuat access + refresh token baru dan menyimpan hash refresh token (rotasi). */
  async issueTokens(user: Pick<User, 'id' | 'name' | 'email' | 'role'>): Promise<AuthResult> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES', '15m') as JwtSignOptions['expiresIn'],
      }),
      this.jwt.signAsync(
        { ...payload, jti: randomUUID() }, // jti membuat setiap refresh token unik
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES', '7d') as JwtSignOptions['expiresIn'],
        },
      ),
    ]);

    await this.usersService.setRefreshTokenHash(user.id, sha256(refreshToken));
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }
}
