'use strict';

const USER = 'plugin::users-permissions.user';
const BOLEH_UBAH = ['nama_lengkap', 'nisn', 'whatsapp', 'kota', 'jenis_kelamin', 'portofolio'];
const SEKOLAH = () => process.env.NAMA_SEKOLAH || 'SMKN 2 Sumedang';
const FOTO_POPULATE = {
  select: ['id', 'documentId', 'name', 'url', 'alternativeText', 'width', 'height', 'formats'],
};

// data yang boleh dilihat siswa lain (TANPA email, NISN, whatsapp)
const umum = (u) => ({
  documentId: u.documentId,
  nama_lengkap: u.nama_lengkap,
  jurusan: u.jurusan,
  jenis_kelamin: u.jenis_kelamin,
  poto_profil: u.poto_profil || null,
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
    const profil = await strapi.db.query(USER).findOne({
      where: { id: u.id },
      populate: { poto_profil: FOTO_POPULATE },
    });
    ctx.body = {
      data: {
        ...umum({ ...u, poto_profil: profil.poto_profil }),
        email: u.email,
        nisn: u.nisn,
        whatsapp: u.whatsapp,
        profil_lengkap: u.profil_lengkap,
      },
    };
  },

  // put /api/profil/saya  (hanya field yang diizinkan)
  async ubahSaya(ctx) {
    const u = ctx.state.user;
    const body = ctx.request.body || {};
    const fotoInput = ctx.request.files?.poto_profil;
    const foto = Array.isArray(fotoInput) ? fotoInput[0] : fotoInput;
    if (Array.isArray(fotoInput) && fotoInput.length > 1) {
      return ctx.badRequest('Hanya boleh mengunggah satu foto profil');
    }
    if (foto && !foto.mimetype?.startsWith('image/')) {
      return ctx.badRequest('Foto profil harus berupa file gambar');
    }
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
    if (foto) {
      const [uploaded] = await strapi.plugin('upload').service('upload').upload({
        data: {},
        files: foto,
      });
      data.poto_profil = uploaded.id;
    }
    await strapi.db.query(USER).update({ where: { id: u.id }, data });
    const profil = await strapi.db.query(USER).findOne({
      where: { id: u.id },
      populate: { poto_profil: FOTO_POPULATE },
    });
    ctx.body = { data: { profil_lengkap: data.profil_lengkap, poto_profil: profil.poto_profil || null } };
  },

  // get /api/profil/:id  (id = documentId, profil publik)
  async lihat(ctx) {
    const u = await strapi.db.query(USER).findOne({
      where: { documentId: ctx.params.id },
      populate: { poto_profil: FOTO_POPULATE },
    });
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
