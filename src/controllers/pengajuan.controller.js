'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

const PENGAJUAN = 'api::pengajuan.pengajuan';
const PERUSAHAAN = 'api::perusahaan.perusahaan';

// link google form yang sudah terisi otomatis email & NISN siswa
function bangunLink(p, user) {
  if (!p.link_google_form) return null;
  const url = new URL(p.link_google_form);
  url.searchParams.set('usp', 'pp_url');
  if (p.entry_email) url.searchParams.set(p.entry_email, user.email);
  if (p.entry_nisn && user.nisn) url.searchParams.set(p.entry_nisn, user.nisn);
  return url.toString();
}

module.exports = createCoreController(PENGAJUAN, ({ strapi }) => ({
  // get /api/pengajuan-saya
  async saya(ctx) {
    const data = await strapi.documents(PENGAJUAN).findMany({
      filters: { pengguna: { id: ctx.state.user.id } },
      populate: { perusahaan: { fields: ['nama', 'kota'] } },
      sort: 'createdAt:desc',
    });
    ctx.body = { data };
  },

  // post /api/pengajuan/mulai  { perusahaan: documentId }
  // membuat catatan pengajuan (status belum_diisi) dan mengembalikan link google form.
  async mulai(ctx) {
    const user = ctx.state.user;
    const { perusahaan } = ctx.request.body || {};
    if (!perusahaan) return ctx.badRequest('Perusahaan wajib diisi');
    if (!user.profil_lengkap) return ctx.badRequest('Lengkapi profil dulu sebelum mengajukan PKL');

    const p = await strapi.documents(PERUSAHAAN).findOne({ documentId: perusahaan, populate: ['jurusan'] });
    if (!p || !p.aktif) return ctx.notFound('Perusahaan tidak ditemukan atau tidak aktif');
    if (p.sisa_kuota <= 0) return ctx.badRequest('Kuota perusahaan ini sudah penuh');
    if (!p.jurusan.some((j) => j.kode === user.jurusan)) {
      return ctx.badRequest('Jurusanmu tidak tersedia di perusahaan ini');
    }

    let pj = await strapi.documents(PENGAJUAN).findFirst({
      filters: { pengguna: { id: user.id }, perusahaan: { documentId: perusahaan } },
    });
    if (!pj) {
      pj = await strapi.documents(PENGAJUAN).create({
        data: { pengguna: { connect: [user.documentId] }, perusahaan: { connect: [perusahaan] } },
      });
    }
    ctx.body = {
      data: {
        documentId: pj.documentId,
        status: pj.status,
        // link hanya diberikan selama formulir belum terkirim -> mencegah isi ganda
        link_form: pj.status === 'belum_diisi' ? bangunLink(p, user) : null,
      },
    };
  },

  // post /api/pengajuan/:id/konfirmasi  (tombol "Ya, saya sudah mengisi")
  async konfirmasi(ctx) {
    const pj = await strapi.documents(PENGAJUAN).findFirst({
      filters: { documentId: ctx.params.id, pengguna: { id: ctx.state.user.id } },
    });
    if (!pj) return ctx.notFound('Pengajuan tidak ditemukan');
    if (pj.status === 'belum_diisi') {
      await strapi.documents(PENGAJUAN).update({
        documentId: pj.documentId,
        data: { status: 'terkirim', dikonfirmasi_siswa: true, waktu_terkirim: new Date() },
      });
    }
    ctx.body = { ok: true };
  },



}));
