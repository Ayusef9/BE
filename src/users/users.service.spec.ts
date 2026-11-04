import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DevicePlatform, Role } from '../common/enums/index.js';
import { DeviceToken } from './entities/device-token.entity.js';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  const users = { findOne: vi.fn(), save: vi.fn(), create: vi.fn((x) => x), update: vi.fn() };
  const devices = { findOne: vi.fn(), save: vi.fn(async (x) => x), create: vi.fn((x) => x), delete: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: users },
        { provide: getRepositoryToken(DeviceToken), useValue: devices },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('create mengubah pelanggaran UNIQUE database menjadi 409', async () => {
    users.save.mockRejectedValue({ driverError: { code: '23505' } });
    await expect(
      service.create({ name: 'A', email: 'a@b.c', passwordHash: 'h', role: Role.USER }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('menonaktifkan user juga menghapus refresh token (paksa logout)', async () => {
    users.findOne.mockResolvedValue({ id: 'u1', isActive: true, refreshTokenHash: 'abc' });
    users.save.mockImplementation(async (u) => u);
    const result = await service.setActive('u1', false);
    expect(result.isActive).toBe(false);
    expect(result.refreshTokenHash).toBeNull();
  });

  it('device token yang sama berpindah ke akun baru, tidak dobel', async () => {
    devices.findOne.mockResolvedValue({ id: 'd1', userId: 'lama', fcmToken: 't', platform: DevicePlatform.IOS });
    await service.registerDevice('baru', { fcmToken: 't', platform: DevicePlatform.ANDROID });
    expect(devices.save).toHaveBeenCalledWith(expect.objectContaining({ userId: 'baru', platform: DevicePlatform.ANDROID }));
    expect(devices.create).not.toHaveBeenCalled();
  });
});
