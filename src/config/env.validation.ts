/**
 * Validasi environment saat aplikasi start. Lebih baik gagal di awal
 * daripada baru error ketika ada request pertama.
 */
const REQUIRED = [
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

export function validateEnv(config: Record<string, unknown>) {
  const missing = REQUIRED.filter((key) => !config[key]);
  if (missing.length) {
    throw new Error(`Environment variable belum diisi: ${missing.join(', ')}. Lihat .env.example`);
  }
  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    if (String(config[key]).length < 32) {
      throw new Error(`${key} minimal 32 karakter`);
    }
  }
  if (config.JWT_ACCESS_SECRET === config.JWT_REFRESH_SECRET) {
    throw new Error('JWT_ACCESS_SECRET dan JWT_REFRESH_SECRET harus berbeda');
  }
  return config;
}
