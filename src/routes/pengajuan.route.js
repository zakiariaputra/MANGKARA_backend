module.exports = {
  routes: [
    { method: 'GET', path: '/pengajuan-saya', handler: 'pengajuan.saya' },
    { method: 'POST', path: '/pengajuan/mulai', handler: 'pengajuan.mulai' },

    { method: 'POST', path: '/pengajuan/:id/konfirmasi', handler: 'pengajuan.konfirmasi' },
  ],
};
