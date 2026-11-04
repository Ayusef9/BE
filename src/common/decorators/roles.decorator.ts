import { SetMetadata } from '@nestjs/common';
import type { Role } from '../enums/index.js';

export const ROLES_KEY = 'roles';

/** Membatasi endpoint untuk role tertentu, misalnya @Roles(Role.ADMIN). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
