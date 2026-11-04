# Wedding+ Backend

Backend untuk **Wedding+**, aplikasi wedding organizer yang menghubungkan calon pengantin dengan mitra vendor.
Tanda **+** melambangkan nilai tambah, inovasi, dan integrasi layanan yang membuat Wedding+ lebih dari sekadar aplikasi wedding organizer biasa.

Satu backend ini melayani dua jenis client:

- **Aplikasi mobile (Flutter)** untuk calon pengantin
- **Dashboard web** untuk admin dan vendor

```
Mobile (Flutter) ─┐
                  ├──► NestJS API (REST + WebSocket) ──► PostgreSQL
Web Dashboard    ─┘            │
(admin + vendor)               ├──► Layanan AI: ChatBot, OCR/PCD
                               └──► Penyimpanan file (bukti transaksi, foto vendor)
```

> Wedding+ **tidak memproses pembayaran**. Semua nilai uang (kesepakatan, bukti transaksi, tabungan) hanya pencatatan.

## Daftar Isi

1. [Tim](#tim)
2. [Teknologi](#teknologi)
3. [Fitur dan Status](#fitur-dan-status)
4. [Menjalankan Proyek](#menjalankan-proyek)
5. [Konfigurasi Environment](#konfigurasi-environment)
6. [Arsitektur](#arsitektur)
7. [Autentikasi](#autentikasi)
8. [Daftar Endpoint](#daftar-endpoint)
9. [Format Respons](#format-respons)
10. [Database dan Migration](#database-dan-migration)
11. [Testing](#testing)
12. [Menambah Module Baru](#menambah-module-baru)
13. [Roadmap](#roadmap)


## Teknologi

| Kebutuhan | Teknologi |
|---|---|
| Framework | NestJS 12 (ESM, TypeScript) |
| ORM dan database | TypeORM 1.x dan PostgreSQL 16 |
| Autentikasi | JWT (access + refresh token), Passport, bcrypt, Google Sign-In |
| Validasi | class-validator dan class-transformer |
| Dokumentasi API | Swagger (`@nestjs/swagger`) |
| Test | Vitest |
| Lint | oxlint |

Dibutuhkan **Node.js 22 atau lebih baru**.

## Fitur dan Status

| # | Fitur | Status |
|---|---|---|
| 1 | Registrasi dan login (user, vendor, admin), login Google | Selesai |
| 2 | Rencana pernikahan | Entity dan DTO saja |
| 3 | Rekomendasi layanan (paket dan per-item) | Sisi vendor selesai, sisi user belum |
| 4 | Chat realtime dan kesepakatan | Entity dan DTO saja |
| 5 | Scheduler | Entity dan DTO saja |
| 6 | Task berkas pernikahan dan OCR | Entity dan DTO saja |
| 7 | Tabungan bersama (notulen) | Entity dan DTO saja |
| 8 | ChatBot | Entity dan DTO saja |
| - | API dashboard admin (verifikasi vendor, kelola user, statistik) | Selesai |

## Menjalankan Proyek

```bash
# 1. Pasang dependency
npm install

# 2. Siapkan environment
cp .env       

# 3. Jalankan PostgreSQL 
docker compose up -d

# 4. Buat tabel dan data awal
npm run migration:run       # membuat 21 tabel
npm run seed                # 8 kategori layanan + akun admin pertama

# 5. Jalankan server
npm run start:dev
```

Setelah berjalan:

| Alamat | Isi |
|---|---|
| `http://localhost:3000/api/v1` | API (cek hidup: `GET /api/v1`) |
| `http://localhost:3000/docs` | Dokumentasi Swagger. Klik **Authorize** lalu isi access token |

Perintah lain: `npm run build`, `npm test`, `npm run lint`.


## Arsitektur

### Struktur folder

Satu fitur sama dengan satu module. Polanya sama di backend, Flutter, dan web supaya nama fitur konsisten di ketiga sisi.

```
src/
├── common/           enum, guard (JWT + role), decorator, util, DTO bersama
├── config/           validasi env dan data-source (untuk migration dan seed)
├── database/         daftar semua entity dan seed
├── migrations/       riwayat perubahan skema
├── auth/             login, register, refresh token, Google
├── users/            profil dan device token (FCM)
├── vendors/          pendaftaran mitra, profil toko, layanan, paket, kategori
├── admin/            verifikasi vendor, kelola user, statistik
└── plans/ recommendations/ chat/ deals/ scheduler/ documents/ savings/ chatbot/
                      entity dan DTO sudah ada, service dan controller belum
```

Isi tiap module:

```
vendors/
├── vendors.module.ts       daftar controller, provider, dan import
├── *.controller.ts         menerima request, memanggil service
├── *.service.ts            logika bisnis
├── dto/                    bentuk dan validasi data masuk
└── entities/               tabel database
```

### Pemisahan tanggung jawab

| Lapisan | Tugas | Tidak boleh |
|---|---|---|
| **Guard** | Memeriksa token dan role | Berisi logika bisnis |
| **Pipe / DTO** | Memvalidasi dan mengubah data masuk | Mengakses database |
| **Controller** | Menerima request, memanggil service, mengembalikan respons | Berisi logika bisnis |
| **Service (Provider)** | Logika bisnis, aturan, transaksi | Mengurus HTTP |
| **Repository (TypeORM)** | Akses database | Berisi aturan bisnis |

Semua dependensi masuk lewat constructor (Dependency Injection). Tidak ada `new Service()` di mana pun.

### Alur request

Contoh: admin memverifikasi vendor.

```
PATCH /api/v1/admin/vendors/:id/verify   (Authorization: Bearer <token>)
  → JwtAuthGuard           token valid? isi request.user          (salah: 401)
  → RolesGuard             role admin?                            (salah: 403)
  → ParseUUIDPipe          id berupa UUID?                        (salah: 400)
  → ValidationPipe         body sesuai VerifyVendorDto?           (salah: 400)
  → AdminController        meneruskan ke service
  → VendorsService.verify  aturan bisnis: vendor ada? status berbeda? (404 / 409)
  → Repository<Vendor>     TypeORM
  → PostgreSQL             UPDATE vendors ...
  → hasil naik kembali → JSON → response 200
```

### Aman secara default

`JwtAuthGuard` dan `RolesGuard` terpasang **global**, jadi endpoint baru otomatis wajib login.

```ts
@Public()                // buka tanpa token
@Roles(Role.ADMIN)       // batasi untuk role tertentu
@CurrentUser() user      // ambil user yang sedang login
```

## Autentikasi

### Email dan password

| Langkah | Endpoint | Hasil |
|---|---|---|
| Daftar | `POST /auth/register` | Akun role `user` dan sepasang token |
| Login | `POST /auth/login` | Sepasang token |
| Perpanjang | `POST /auth/refresh` | Sepasang token baru |
| Keluar | `POST /auth/logout` | Refresh token dicabut |

- **Access token** berumur pendek (15 menit), dikirim di header `Authorization: Bearer <token>`.
- **Refresh token** berumur 7 hari dan **dirotasi**: setiap refresh menerbitkan token baru dan mematikan yang lama. Jika token lama dipakai ulang, sesi dicabut (indikasi token dicuri).
- Refresh token disimpan di database sebagai SHA-256, bukan token mentah.
- **Satu sesi per akun.** Login di perangkat kedua membuat refresh token perangkat pertama tidak berlaku.
- Register publik **selalu** menghasilkan role `user`. Vendor mendaftar lewat `/vendors/register`, admin dibuat lewat seed.

### Vendor

Mitra mendaftar lewat `POST /vendors/register` (seperti membuat toko di marketplace) dengan status **`pending`**. Admin memverifikasi menjadi `active` atau `rejected`. Vendor yang belum `active` tidak bisa mengelola layanan dan paket (403).

### Login dengan Google

Satu endpoint untuk mobile dan web: `POST /auth/google` dengan body `{ "idToken": "..." }`.

1. **Flutter:** paket `google_sign_in`, ambil `idToken`. **Web:** Google Identity Services, ambil `credential`.
2. Server memverifikasi tanda tangan, penerbit, masa berlaku, dan audience (client ID kita), lalu menerbitkan token yang sama dengan login biasa.

Aturan akun:

| Kondisi | Hasil |
|---|---|
| Akun Google sudah terhubung | Langsung login |
| Email belum terdaftar | Dibuat akun baru, role `user`, tanpa password |
| Email sudah terdaftar lewat password | **Ditolak (409)**, tidak digabung otomatis |
| Akun nonaktif | 403 |

Email yang sudah terdaftar tidak digabung otomatis karena email saat daftar belum diverifikasi. Penggabungan otomatis membuka celah pengambilalihan akun. Pengguna login dengan password, lalu memanggil `POST /auth/google/link` untuk menghubungkan akun Google-nya. Vendor dan admin tidak bisa mendaftar lewat Google.

## Daftar Endpoint

Prefix `/api/v1`. Semua endpoint wajib `Authorization: Bearer <accessToken>` kecuali bertanda **(public)**.

| Kelompok | Endpoint | Role |
|---|---|---|
| Health | `GET /` (public) | - |
| Auth | `POST /auth/register` (public) | - |
| | `POST /auth/login` (public) | - |
| | `POST /auth/google` (public) | - |
| | `POST /auth/refresh` (public) | - |
| | `POST /auth/google/link` | semua |
| | `POST /auth/logout` | semua |
| | `GET /auth/me` | semua |
| Users | `GET /users/me`, `PATCH /users/me` | semua |
| | `POST /users/me/device-tokens` | semua |
| | `DELETE /users/me/device-tokens/:fcmToken` | semua |
| Vendor | `POST /vendors/register` (public) | - |
| | `GET /vendors/me`, `PATCH /vendors/me` | vendor |
| Layanan | `GET`, `POST /vendors/me/service-items` | vendor aktif |
| | `PATCH`, `DELETE /vendors/me/service-items/:id` | vendor aktif |
| Paket | `GET`, `POST /vendors/me/packages` | vendor aktif |
| | `GET`, `PATCH`, `DELETE /vendors/me/packages/:id` | vendor aktif |
| Kategori | `GET /service-categories` | semua |
| | `POST`, `PATCH`, `DELETE /service-categories/:id` | admin |
| Admin | `GET /admin/vendors`, `GET /admin/vendors/:id` | admin |
| | `PATCH /admin/vendors/:id/verify` | admin |
| | `GET /admin/users`, `PATCH /admin/users/:id/active` | admin |
| | `GET /admin/stats` | admin |

Dokumentasi lengkap beserta contoh body ada di Swagger (`/docs`).

## Format Respons

**Daftar** memakai paginasi lewat query `?page=1&limit=10` (limit maksimal 100):

```json
{
  "data": [ ... ],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

**Error** selalu berbentuk:

```json
{ "message": "Email atau password salah", "error": "Unauthorized", "statusCode": 401 }
```

Untuk error validasi, `message` berupa daftar pesan.

| Kode | Arti |
|---|---|
| 400 | Data tidak valid |
| 401 | Token tidak ada, salah, atau kedaluwarsa |
| 403 | Role tidak sesuai, akun nonaktif, atau vendor belum diverifikasi |
| 404 | Data tidak ditemukan (juga dipakai jika data milik orang lain) |
| 409 | Konflik, misalnya email sudah terdaftar |
| 503 | Fitur belum dikonfigurasi (misalnya login Google) |

## Database dan Migration

Ada **21 tabel**. Rancangan lengkap (kolom, relasi, constraint, ERD) ada di dokumen `Wedding_Plus_Rancangan_Database.pdf`.

Skema dikelola lewat **migration**, bukan `synchronize`. Dengan migration, setiap perubahan skema tercatat, bisa di-revert, dan seluruh tim memiliki skema yang sama lewat `git pull` lalu `npm run migration:run`.

```bash
npm run migration:generate -- src/migrations/NamaPerubahan   # buat dari perubahan entity
npm run migration:run                                         # terapkan
npm run migration:revert                                      # batalkan yang terakhir
```

Aturan:

- **Baca isi file migration hasil generate sebelum menjalankannya**, terutama jika ada `DROP COLUMN`.
- **Jangan menyalakan `synchronize: true`** bersamaan dengan migration, karena tabel sudah dibuat dan migration akan gagal.
- Semua entity wajib didaftarkan di `src/database/entities.ts`, termasuk entity dari module yang belum dibuat, karena TypeORM membutuhkan metadata semua entity yang saling berelasi.

Keputusan desain yang penting:

- `deals.amount` adalah **snapshot** nilai kesepakatan, bukan dihitung ulang dari harga paket.
- Ringkasan budget **tidak disimpan**, dihitung dari `SUM(deals.amount)` dengan status `accepted`.
- `deals.status` (pending, accepted, rejected, cancelled) dan `plan_needs.status` (belum_dipilih, negosiasi, disepakati, bukti_terunggah) adalah dua hal berbeda.
- Nilai uang memakai `DECIMAL(14,2)` dan dikonversi ke `number` lewat `decimalTransformer`.
- Soft delete (`deleted_at`) dipakai pada users, vendors, service_items, packages, dan wedding_plans.

## Testing

```bash
npm test                                                     # unit test (Vitest)
ADMIN_PASSWORD=<SEED_ADMIN_PASSWORD> node scripts/smoke-test.mjs   # end-to-end
```

- **Unit test** memakai mock untuk dependensi (contoh DI dengan `useValue`).
- **Smoke test** menguji alur sungguhan terhadap server yang sedang berjalan: auth, rotasi refresh token, pembatasan role, verifikasi vendor, layanan, paket, kelola user, dan login Google (token palsu harus ditolak). Server harus berjalan dan database sudah di-seed. Gunakan database pengembangan, karena skrip ini membuat data uji.
- Verifikasi token ke server Google sungguhan tidak bisa diuji otomatis. Uji manual sekali dengan akun Google asli setelah `GOOGLE_CLIENT_IDS` diisi.

## Menambah Module Baru

1. Buat folder `src/<nama>/` berisi `entities/`, `dto/`, `<nama>.service.ts`, `<nama>.controller.ts`, `<nama>.module.ts`.
2. Daftarkan entity di `src/database/entities.ts` (jika belum), dan di module lewat `TypeOrmModule.forFeature([...])`.
3. Import module di `app.module.ts`.
4. Pasang `@Roles(...)` pada controller. Endpoint otomatis wajib login.
5. Buat DTO dengan class-validator. `ValidationPipe` global menolak field yang tidak dikenal.
6. Jika ada perubahan entity, jalankan `migration:generate` lalu baca hasilnya.
7. Tambahkan unit test untuk logika bisnis, dan pengecekan di `scripts/smoke-test.mjs`.
8. Jika module memanggil module lain, import module tersebut dan pakai service yang di-`exports`. Untuk efek samping lintas module (misalnya kesepakatan yang mengubah budget dan membuat jadwal), pakai event (`EventEmitter2`) agar antar-module tidak saling bergantung erat.

## Roadmap

| Tahap | Pekerjaan | Status |
|---|---|---|
| 1 | Setup NestJS, TypeORM, Swagger, ERD | Selesai |
| 2 | Auth (JWT, refresh, role guard, Google) | Selesai |
| 3 | Vendors dan Admin | Selesai |
| 4 | Paket dan item layanan | Selesai |
| 5 | `plans` dan `recommendations` | Berikutnya |
| 6 | `chat` (Socket.IO) dan `deals` dengan event `deal.proposed` / `deal.accepted` | Belum |
| 7 | `scheduler` dan notifikasi (FCM) | Belum |
| 8 | `documents` (upload dan OCR) dan `savings` | Belum |
| 9 | `chatbot` (jembatan ke layanan AI) | Belum |
| 10 | Testing, perbaikan, dan deploy | Belum |

