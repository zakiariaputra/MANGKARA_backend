module.exports = {
  routes: [
    { method: 'GET', path: '/profil/saya', handler: 'profil.saya' },
    { method: 'PUT', path: '/profil/saya', handler: 'profil.ubahSaya' },
    { method: 'GET', path: '/profil/:id', handler: 'profil.lihat' },
  ],
};
