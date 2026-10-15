'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

const ULASAN = 'api::ulasan.ulasan';
const PERUSAHAAN = 'api::perusahaan.perusahaan';
const PENGAJUAN = 'api::pengajuan.pengajuan';

module.exports = createCoreController(ULASAN, ({ strapi }) => ({
  // GET /api/ulasan-perusahaan/:id  (id = documentId perusahaan)
  async daftar(ctx) {
    const baris = await strapi.documents(ULASAN).findMany({
      filters: { perusahaan: { documentId: ctx.params.id } },
      populate: { pengguna: { fields: ['nama_lengkap', 'jurusan'] } },
      sort: 'createdAt:desc',
    });
    const distribusi = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    baris.forEach((r) => { distribusi[r.bintang] += 1; });
    ctx.body = {
      data: baris.map((r) => ({
        documentId: r.documentId,
        bintang: r.bintang,
        isi: r.isi,
        tanggal: r.createdAt,
        pengguna: r.pengguna
          ? { documentId: r.pengguna.documentId, nama_lengkap: r.pengguna.nama_lengkap, jurusan: r.pengguna.jurusan }
          : null,
      })),
      meta: { distribusi, total: baris.length },
    };
  },

  // GET /api/ulasan-saya  -> satu ulasan milik akun ini (atau null)
  async saya(ctx) {
    const u = await strapi.documents(ULASAN).findFirst({
      filters: { pengguna: { id: ctx.state.user.id } },
      populate: { perusahaan: { fields: ['nama'] } },
    });
    ctx.body = { data: u };
  },

  // post /api/ulasan  { perusahaan: documentId, bintang: 1-5, isi }
  async buat(ctx) {
    const user = ctx.state.user;
    const { perusahaan, bintang, isi } = ctx.request.body || {};
    const n = Number(bintang);
    if (!perusahaan || !Number.isInteger(n) || n < 1 || n > 5) {
      return ctx.badRequest('Perusahaan dan bintang (1-5) wajib diisi');
    }
    const p = await strapi.documents(PERUSAHAAN).findOne({ documentId: perusahaan });
    if (!p) return ctx.notFound('Perusahaan tidak ditemukan');

    // aturan: 1 akun hanya boleh 1 ulasan
    const sudah = await strapi.documents(ULASAN).findFirst({
      filters: { pengguna: { id: user.id } },
      populate: { perusahaan: { fields: ['nama'] } },
    });
    if (sudah) {
      return ctx.badRequest(
        `Kamu sudah pernah mengulas ${sudah.perusahaan ? sudah.perusahaan.nama : 'perusahaan lain'}. Hapus ulasan itu dulu jika ingin mengulas perusahaan lain.`
      );
    }

    if (process.env.ULASAN_WAJIB_DITERIMA === 'true') {
      const diterima = await strapi.documents(PENGAJUAN).findFirst({
        filters: { pengguna: { id: user.id }, perusahaan: { documentId: perusahaan }, status: 'diterima' },
      });
      if (!diterima) return ctx.forbidden('Hanya siswa yang diterima PKL di perusahaan ini yang boleh mengulas');
    }

    const dibuat = await strapi.documents(ULASAN).create({
      data: {
        bintang: n,
        isi: isi ? String(isi).slice(0, 1000) : null,
        pengguna: { connect: [user.documentId] },
        perusahaan: { connect: [perusahaan] },
      },
    });
    ctx.body = { data: { documentId: dibuat.documentId } };
  },

  // delete /api/ulasan/:id  (hanya ulasan milik sendiri)
  async hapus(ctx) {
    const u = await strapi.documents(ULASAN).findFirst({
      filters: { documentId: ctx.params.id, pengguna: { id: ctx.state.user.id } },
    });
    if (!u) return ctx.notFound('Ulasan tidak ditemukan');
    await strapi.documents(ULASAN).delete({ documentId: u.documentId });
    ctx.body = { ok: true };
  },
}));
