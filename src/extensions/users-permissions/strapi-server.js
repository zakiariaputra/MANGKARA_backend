'use strict';

// penyambung wajib strapi. daftar kolom ada di src/models/pengguna.fields.js
module.exports = (plugin) => {
  Object.assign(plugin.contentTypes.user.schema.attributes, require('../../models/pengguna.fields'));
  return plugin;
};
