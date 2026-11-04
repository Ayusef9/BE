import type { Role } from '../enums/index.js';

/** Isi JWT access token. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

/** Objek yang ditempel ke request.user setelah JwtAuthGuard lolos. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
