'use strict';

// kolom tambahan tabel pengguna (up_users). tambah/ubah kolom profil di sini.
module.exports = {
  nama_lengkap: { type: 'string' },
  jurusan: { type: 'enumeration', enum: ['AKL', 'MPLB', 'PM', 'PPLG'] },
  nisn: { type: 'string' },
  whatsapp: { type: 'string' },
  kota: { type: 'string' },
  jenis_kelamin: { type: 'enumeration', enum: ['laki_laki', 'perempuan'] },
  portofolio: { type: 'text' },
  profil_lengkap: { type: 'boolean', default: false },
  poto_profil: { type: 'media', multiple: false, allowedTypes: ['images'] },
};
