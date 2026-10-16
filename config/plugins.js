module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      // field tambahan yang boleh dikirim saat daftar akun
      register: { allowedFields: ['nama_lengkap', 'jurusan'] },
    },
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env.int('SMTP_PORT', 587),
        auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
      },
      settings: { defaultFrom: env('SMTP_USER'), defaultReplyTo: env('SMTP_USER') },
    },
  },
});
