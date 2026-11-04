import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

/** Dipakai oleh TypeORM CLI (migration) dan seed. Aplikasi sendiri memakai konfigurasi di app.module.ts. */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || '',

  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
});
