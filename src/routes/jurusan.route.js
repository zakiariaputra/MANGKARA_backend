const { createCoreRouter } = require('@strapi/strapi').factories;
module.exports = createCoreRouter('api::jurusan.jurusan', { only: ['find'] });
