module.exports = {
  routes: [
    { method: 'GET', path: '/ulasan-perusahaan/:id', handler: 'ulasan.daftar' },
    { method: 'GET', path: '/ulasan-saya', handler: 'ulasan.saya' },
    { method: 'POST', path: '/ulasan', handler: 'ulasan.buat' },
    { method: 'DELETE', path: '/ulasan/:id', handler: 'ulasan.hapus' },
  ],
};
