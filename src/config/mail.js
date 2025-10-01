const nodemailer = require('nodemailer');

function createTransport() {
  const secure = String(process.env.SMTP_SECURE || 'true') === 'true';
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || (secure ? 465 : 587)),
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

module.exports = { createTransport };
