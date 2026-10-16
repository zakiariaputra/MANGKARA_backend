# MANGKARA Backend

Backend API untuk MANGKARA, aplikasi pengelolaan data siswa dan kegiatan PKL. Proyek ini menggunakan Strapi 5, Node.js, dan MySQL.

## Kebutuhan

- Node.js 18 sampai 22
- npm
- MySQL

## Menjalankan secara lokal

1. Clone repository dan masuk ke folder backend.
2. Buat database MySQL, misalnya `mangkara`.
3. Salin `.env.example` menjadi `.env`, lalu isi nilai yang masih kosong. Pastikan secret di bawah dibuat acak dan tidak memakai nilai contoh:

```env
APP_KEYS=
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
TRANSFER_TOKEN_SALT=
ENCRYPTION_KEY=
JWT_SECRET=
DATABASE_NAME=mangkara
DATABASE_USERNAME=root
DATABASE_PASSWORD=
```

File `.env.example` memuat konfigurasi lainnya, termasuk host/port, URL frontend, SMTP, dan aturan ulasan. Sesuaikan dengan lingkungan lokal. Jangan membagikan atau meng-commit file `.env`.

4. Pasang dependensi dan jalankan server mode pengembangan:

```bash
npm install
npm run develop
```

Strapi tersedia di `http://localhost:1337`, sedangkan panel admin berada di `http://localhost:1337/admin`. Buat akun admin saat pertama kali membuka panel. Strapi akan membuat atau memperbarui tabel database saat dijalankan. Data jurusan awal ditambahkan otomatis jika belum ada.

Untuk build dan menjalankan mode produksi:

```bash
npm run build
npm run start
```

## Fitur utama

- Akun dan autentikasi siswa melalui plugin Users & Permissions Strapi.
- Profil siswa dengan data jurusan, NISN, WhatsApp, kota, jenis kelamin, dan portofolio.
- Data perusahaan PKL, kuota, jurusan yang diterima, dan tautan formulir pendaftaran.
- Pengajuan PKL dengan status `belum_diisi`, `terkirim`, `diteruskan`, `diterima`, atau `ditolak`.
- Ulasan perusahaan dengan rating 1–5.

API menggunakan prefix `/api`. Endpoint standar autentikasi Strapi yang umum digunakan:

- `POST /api/auth/local/register` untuk membuat akun.
- `POST /api/auth/local` untuk login; gunakan JWT yang dikembalikan sebagai `Authorization: Bearer TOKEN_ANDA` pada endpoint yang memerlukan login.

Endpoint aplikasi:

| Method | Endpoint | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/api/daftar-jurusan` | Publik | Daftar jurusan |
| `GET` | `/api/daftar-perusahaan` | Publik | Daftar perusahaan |
| `GET` | `/api/daftar-perusahaan/:id` | Publik | Detail perusahaan |
| `GET` | `/api/profil/saya` | Login | Profil lengkap akun sendiri |
| `PUT` | `/api/profil/saya` | Login | Mengubah data profil yang diizinkan |
| `GET` | `/api/profil/:id` | Login | Profil publik siswa |
| `GET` | `/api/pengajuan-saya` | Login | Daftar pengajuan akun sendiri |
| `POST` | `/api/pengajuan/mulai` | Login | Mulai pengajuan; body berisi `perusahaan` (document ID) |
| `POST` | `/api/pengajuan/:id/konfirmasi` | Login | Konfirmasi formulir telah dikirim |
| `GET` | `/api/ulasan-perusahaan/:id` | Login | Ulasan dan distribusi rating perusahaan |
| `GET` | `/api/ulasan-saya` | Login | Ulasan akun sendiri |
| `POST` | `/api/ulasan` | Login | Membuat ulasan |
| `DELETE` | `/api/ulasan/:id` | Login | Menghapus ulasan milik sendiri |

Endpoint daftar perusahaan juga mendukung query parameter standar Strapi seperti `filters`, `sort`, `pagination`, dan `populate`. Format respons mengikuti format respons REST Strapi kecuali endpoint khusus yang mengembalikan bentuk respons sendiri.

Hak akses endpoint publik dan pengguna login diatur otomatis saat aplikasi mulai melalui `src/config/izin.js` dan `src/index.js`. Untuk menambah endpoint khusus, daftarkan route dan action yang sesuai di izin bootstrap. Pengelolaan data perusahaan dan pemeriksaan pengajuan dilakukan melalui panel admin.

## Catatan pengembangan

- Skema content type dan implementasi API berada di `src/api`, `src/routes`, dan `src/controllers`.
- Konfigurasi database ada di `config/database.js`; konfigurasi CORS menggunakan `FRONTEND_URL`.
- Perubahan skema pengguna perlu diselaraskan pada `src/models/pengguna.fields.js` dan implementasi profil terkait.
- Sebelum menjalankan perubahan pada data penting, pastikan database sudah dicadangkan.
