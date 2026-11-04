import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/index.js';
import { RolesGuard } from './roles.guard.js';

const ctx = (user?: { role: Role }) =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it('mengizinkan endpoint tanpa @Roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(ctx({ role: Role.USER }))).toBe(true);
  });

  it('mengizinkan role yang sesuai', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    expect(guard.canActivate(ctx({ role: Role.ADMIN }))).toBe(true);
  });

  it('menolak role yang tidak sesuai (user tidak boleh masuk area admin)', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    expect(() => guard.canActivate(ctx({ role: Role.USER }))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(ctx({ role: Role.VENDOR }))).toThrow(ForbiddenException);
  });

  it('menolak jika tidak ada user di request', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    expect(() => guard.canActivate(ctx(undefined))).toThrow(ForbiddenException);
  });
});
