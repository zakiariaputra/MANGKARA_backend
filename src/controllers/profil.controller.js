'use strict';

const USER = 'plugin::users-permissions.user';
const BOLEH_UBAH = ['nama_lengkap', 'nisn', 'whatsapp', 'kota', 'jenis_kelamin', 'portofolio'];
const SEKOLAH = () => process.env.NAMA_SEKOLAH || 'SMKN 2 Sumedang';

// data yang boleh dilihat siswa lain (TANPA email, NISN, whatsapp)
const umum = (u) => ({
  documentId: u.documentId,
  nama_lengkap: u.nama_lengkap,
  jurusan: u.jurusan,
  jenis_kelamin: u.jenis_kelamin,
  sebutan: u.jenis_kelamin === 'perempuan' ? 'Siswi' : u.jenis_kelamin === 'laki_laki' ? 'Siswa' : 'Siswa/Siswi',
  kota: u.kota,
  portofolio: u.portofolio,
  sekolah: SEKOLAH(),
  bergabung_sejak: u.createdAt,
});

module.exports = {
  // get /api/profil/saya  (data lengkap milik sendiri)
  async saya(ctx) {
    const u = ctx.state.user;
    ctx.body = {
      data: { ...umum(u), email: u.email, nisn: u.nisn, whatsapp: u.whatsapp, profil_lengkap: u.profil_lengkap },
    };
  },

  // put /api/profil/saya  (hanya field yang diizinkan)
  async ubahSaya(ctx) {
    const u = ctx.state.user;
    const body = ctx.request.body || {};
    const data = {};
    for (const k of BOLEH_UBAH) {
      if (body[k] === undefined) continue;
      data[k] = typeof body[k] === 'string' ? body[k].trim() : body[k];
      if (data[k] === '') data[k] = null;
    }
    if (data.jenis_kelamin && !['laki_laki', 'perempuan'].includes(data.jenis_kelamin)) {
      return ctx.badRequest('Jenis kelamin tidak valid');
    }
    if (data.nisn && !/^\d{10}$/.test(data.nisn)) return ctx.badRequest('NISN harus 10 digit angka');
    if (data.whatsapp && !/^\d{9,15}$/.test(data.whatsapp)) return ctx.badRequest('Nomor WhatsApp hanya angka (9-15 digit)');

    const gabung = { ...u, ...data };
    data.profil_lengkap = Boolean(gabung.nisn && gabung.whatsapp && gabung.kota && gabung.jenis_kelamin);
    await strapi.db.query(USER).update({ where: { id: u.id }, data });
    ctx.body = { data: { profil_lengkap: data.profil_lengkap } };
  },

  // get /api/profil/:id  (id = documentId, profil publik)
  async lihat(ctx) {
    const u = await strapi.db.query(USER).findOne({ where: { documentId: ctx.params.id } });
    if (!u) return ctx.notFound('Siswa tidak ditemukan');
    const ulasan = await strapi.documents('api::ulasan.ulasan').findMany({
      filters: { pengguna: { id: u.id } },
      populate: { perusahaan: { fields: ['nama'] } },
    });
    const diterima = await strapi.documents('api::pengajuan.pengajuan').findFirst({
      filters: { pengguna: { id: u.id }, status: 'diterima' },
      populate: { perusahaan: { fields: ['nama'] } },
    });
    ctx.body = {
      data: {
        ...umum(u),
        tempat_pkl: diterima && diterima.perusahaan ? diterima.perusahaan.nama : null,
        ulasan: ulasan.map((x) => ({
          bintang: x.bintang,
          isi: x.isi,
          tanggal: x.createdAt,
          perusahaan: x.perusahaan ? x.perusahaan.nama : null,
        })),
      },
    };
  },
};
