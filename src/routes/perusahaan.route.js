const { createCoreRouter } = require('@strapi/strapi').factories;
module.exports = createCoreRouter('api::perusahaan.perusahaan', { only: ['find', 'findOne'] });
