import { Test } from '@nestjs/testing';
import { UsersService } from '../users/users.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { register: vi.fn(), login: vi.fn(), refresh: vi.fn(), logout: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: { findById: vi.fn() } },
      ],
    }).compile();
    controller = module.get(AuthController);
  });

  it('meneruskan refresh token ke service', async () => {
    authService.refresh.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });
    await controller.refresh({ refreshToken: 'token-lama' });
    expect(authService.refresh).toHaveBeenCalledWith('token-lama');
  });

  it('logout memakai id user dari token', async () => {
    await controller.logout({ id: 'u1', email: 'a@b.c', role: 'user' as never });
    expect(authService.logout).toHaveBeenCalledWith('u1');
  });
});
