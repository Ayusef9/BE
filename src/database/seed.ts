import { Role } from '../common/enums/index.js';
import { hashPassword } from '../common/utils/password.js';
import dataSource from '../config/data-source.js';
import { ServiceCategory } from '../vendors/entities/service-category.entity.js';
import { User } from '../users/entities/user.entity.js';

const CATEGORIES = [
  'Venue',
  'Katering',
  'Dekorasi',
  'Dokumentasi',
  'Rias & Busana',
  'Hiburan & MC',
  'Undangan & Suvenir',
  'Transportasi',
];

async function seed() {
  await dataSource.initialize();

  // Kategori layanan (aman dijalankan berulang)
  const categories = dataSource.getRepository(ServiceCategory);
  for (const [index, name] of CATEGORIES.entries()) {
    if (!(await categories.exists({ where: { name } }))) {
      await categories.save(categories.create({ name, sortOrder: index + 1 }));
    }
  }

  // Akun admin pertama
  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@weddingplus.local').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const users = dataSource.getRepository(User);
  if (!(await users.exists({ where: { email } }))) {
    if (!password) {
      throw new Error('Isi SEED_ADMIN_PASSWORD di .env untuk membuat akun admin pertama');
    }
    await users.save(
      users.create({ name: 'Administrator', email, passwordHash: await hashPassword(password), role: Role.ADMIN }),
    );
    console.log(`Admin dibuat: ${email}`);
  } else {
    console.log(`Admin sudah ada: ${email}`);
  }

  console.log(`Seed selesai (${CATEGORIES.length} kategori).`);
  await dataSource.destroy();
}

await seed();
