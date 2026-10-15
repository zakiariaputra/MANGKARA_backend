'use strict';

// hitung ulang rating_rata & jumlah_ulasan semua perusahaan setiap ada ulasan
// dibuat/diubah/dihapus (lewat API maupun lewat panel admin Strapi).
// skala satu sekolah kecil, jadi hitung-ulang-semua masih ringan.
async function hitungUlang() {
  const ulasan = await strapi.db.query('api::ulasan.ulasan').findMany({
    populate: { perusahaan: { select: ['id'] } },
  });
  const total = {};
  for (const u of ulasan) {
    if (!u.perusahaan) continue;
    const t = (total[u.perusahaan.id] = total[u.perusahaan.id] || { jumlah: 0, bintang: 0 });
    t.jumlah += 1;
    t.bintang += u.bintang;
  }
  const daftar = await strapi.db.query('api::perusahaan.perusahaan').findMany({
    select: ['id', 'rating_rata', 'jumlah_ulasan'],
  });
  for (const p of daftar) {
    const t = total[p.id];
    const rata = t ? Math.round((t.bintang / t.jumlah) * 10) / 10 : 0;
    const jumlah = t ? t.jumlah : 0;
    if (Number(p.rating_rata) !== rata || p.jumlah_ulasan !== jumlah) {
      await strapi.db.query('api::perusahaan.perusahaan').update({
        where: { id: p.id },
        data: { rating_rata: rata, jumlah_ulasan: jumlah },
      });
    }
  }
}

module.exports = {
  afterCreate: hitungUlang,
  afterUpdate: hitungUlang,
  afterDelete: hitungUlang,
  afterDeleteMany: hitungUlang,
};
