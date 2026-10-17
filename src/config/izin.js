'use strict';

// hak akses API. endpoint baru di routes/ harus didaftarkan di sini.
module.exports = {
  // siswa yang sudah login
  login: [
    'api::perusahaan.perusahaan.find',
    'api::perusahaan.perusahaan.findOne',
    'api::jurusan.jurusan.find',
    'api::ulasan.ulasan.daftar',
    'api::ulasan.ulasan.saya',
    'api::ulasan.ulasan.buat',
    'api::ulasan.ulasan.hapus',
    'api::pengajuan.pengajuan.saya',
    'api::pengajuan.pengajuan.mulai',
    'api::pengajuan.pengajuan.konfirmasi',
    'api::profil.profil.saya',
    'api::profil.profil.ubahSaya',
    'api::profil.profil.lihat',
  ],
  // belum login (daftar jurusan/perusahaan dan profil publik)
  publik: [
    'api::jurusan.jurusan.find',
    'api::perusahaan.perusahaan.find',
    'api::perusahaan.perusahaan.findOne',
    'api::profil.profil.lihat',
  ],
};
