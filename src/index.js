'use strict';

const JURUSAN = require('./config/jurusan');
const IZIN = require('./config/izin');

async function beriIzin(tipePeran, daftar) {
  const peran = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: tipePeran } });
  if (!peran) return;
  for (const action of daftar) {
    const ada = await strapi.db.query('plugin::users-permissions.permission').findOne({ where: { action, role: peran.id } });
    if (!ada) await strapi.db.query('plugin::users-permissions.permission').create({ data: { action, role: peran.id } });
  }
}

async function isiJurusan() {
  const jurusanDoc = strapi.documents('api::jurusan.jurusan');
  if ((await jurusanDoc.count({})) === 0) {
    for (const j of JURUSAN) await jurusanDoc.create({ data: j });
  }
}

module.exports = {
  register() {},

  async bootstrap() {
    await isiJurusan();
    await beriIzin('authenticated', IZIN.login);
    await beriIzin('public', IZIN.publik);

    // alamat halaman reset password di frontend
    const store = strapi.store({ type: 'plugin', name: 'users-permissions', key: 'advanced' });
    const nilai = (await store.get()) || {};
    await store.set({
      value: { ...nilai, email_reset_password: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password` },
    });
  },
};
