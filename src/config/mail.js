// src/config/mail.js
const nodemailer = require('nodemailer');

function createTransport() {
  // Si es Gmail, usa el "service" (más estable en Render)
  const isGmail = (process.env.SMTP_SERVICE === 'gmail') ||
                  /gmail\.com$/i.test(process.env.SMTP_HOST || '');

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER, // tu cuenta
        pass: process.env.SMTP_PASS, // app password de Google
      },
      // Evita problemas de handshake en Render
      pool: true,
      maxConnections: 2,
      maxMessages: 20,
      rateDelta: 1000,
      rateLimit: 5,
    });
  }

  // Fallback genérico (si usaras otro proveedor)
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || (secure ? 465 : 587)),
    secure,                 // true con 465, false con 587
    requireTLS: !secure,    // fuerza STARTTLS en 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 20000,
    tls: { rejectUnauthorized: false },
    pool: true,
  });
}

module.exports = { createTransport };
