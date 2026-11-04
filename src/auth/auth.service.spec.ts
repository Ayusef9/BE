import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Role } from '../common/enums/index.js';
import { hashPassword } from '../common/utils/password.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

const ENV: Record<string, string> = {
  JWT_ACCESS_SECRET: 'a'.repeat(40),
  JWT_REFRESH_SECRET: 'b'.repeat(40),
};

describe('AuthService', () => {
  let service: AuthService;
  const users = {
    create: vi.fn(),
    findByEmailWithSecrets: vi.fn(),
    findByIdWithRefreshHash: vi.fn(),
    setRefreshTokenHash: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: string) => ENV[key] ?? fallback,
            getOrThrow: (key: string) => ENV[key],
          },
        },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  const baseUser = { id: 'u1', name: 'Budi', email: 'budi@test.com', role: Role.USER, isActive: true };

  it('register selalu membuat role user dan menyimpan password sebagai hash', async () => {
    users.create.mockImplementation(async (input) => ({ ...baseUser, ...input, id: 'u1' }));
    const result = await service.register({ name: 'Budi', email: 'budi@test.com', password: 'Passw0rd1' });

    const input = users.create.mock.calls[0][0];
    expect(input.role).toBe(Role.USER);
    expect(input.passwordHash).not.toBe('Passw0rd1');
    expect(input.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });

  it('login menolak password salah dan email tidak terdaftar dengan pesan yang sama', async () => {
    users.findByEmailWithSecrets.mockResolvedValueOnce({ ...baseUser, passwordHash: await hashPassword('Benar123') });
    await expect(service.login({ email: 'budi@test.com', password: 'Salah123' })).rejects.toThrow(
      new UnauthorizedException('Email atau password salah'),
    );

    users.findByEmailWithSecrets.mockResolvedValueOnce(null);
    await expect(service.login({ email: 'tidakada@test.com', password: 'Apapun123' })).rejects.toThrow(
      new UnauthorizedException('Email atau password salah'),
    );
  });

  it('login menolak akun nonaktif', async () => {
    users.findByEmailWithSecrets.mockResolvedValue({ ...baseUser, isActive: false, passwordHash: await hashPassword('Benar123') });
    await expect(service.login({ email: 'budi@test.com', password: 'Benar123' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('login berhasil mengembalikan token dan menyimpan hash refresh token', async () => {
    users.findByEmailWithSecrets.mockResolvedValue({ ...baseUser, passwordHash: await hashPassword('Benar123') });
    const result = await service.login({ email: 'budi@test.com', password: 'Benar123' });
    expect(result.user).toEqual({ id: 'u1', name: 'Budi', email: 'budi@test.com', role: Role.USER });
    const [, storedHash] = users.setRefreshTokenHash.mock.calls[0];
    expect(storedHash).toMatch(/^[0-9a-f]{64}$/); // SHA-256, bukan token mentah
    expect(storedHash).not.toBe(result.refreshToken);
  });

  describe('refresh', () => {
    it('menerbitkan token baru jika refresh token adalah yang terakhir disimpan', async () => {
      users.create.mockResolvedValue(baseUser);
      const first = await service.issueTokens(baseUser);
      const storedHash = users.setRefreshTokenHash.mock.calls[0][1];
      users.findByIdWithRefreshHash.mockResolvedValue({ ...baseUser, refreshTokenHash: storedHash });

      const next = await service.refresh(first.refreshToken);
      expect(next.refreshToken).not.toBe(first.refreshToken); // jti membuat token selalu unik
    });

    it('mencabut sesi jika yang dipakai bukan refresh token terbaru', async () => {
      const old = await service.issueTokens(baseUser);
      users.findByIdWithRefreshHash.mockResolvedValue({ ...baseUser, refreshTokenHash: 'f'.repeat(64) });

      await expect(service.refresh(old.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(users.setRefreshTokenHash).toHaveBeenLastCalledWith('u1', null);
    });

    it('menolak token sampah dan access token (secret berbeda)', async () => {
      await expect(service.refresh('bukan-jwt')).rejects.toBeInstanceOf(UnauthorizedException);
      const { accessToken } = await service.issueTokens(baseUser);
      await expect(service.refresh(accessToken)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('menolak jika user sudah logout (hash kosong)', async () => {
      const tokens = await service.issueTokens(baseUser);
      users.findByIdWithRefreshHash.mockResolvedValue({ ...baseUser, refreshTokenHash: null });
      await expect(service.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  it('logout menghapus hash refresh token', async () => {
    await service.logout('u1');
    expect(users.setRefreshTokenHash).toHaveBeenCalledWith('u1', null);
  });
});
