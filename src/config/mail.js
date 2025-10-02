// src/config/mail.js
const nodemailer = require('nodemailer');

function createTransport() {
  // STARTTLS (587) por defecto
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || (secure ? 465 : 587));

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure, // true solo si usas 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Evita falsos negativos por certificados intermedios en Render
    tls: { rejectUnauthorized: false },
    // Para que no corte rápido en plataformas con jitter de red
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
  });

  return transporter;
}

module.exports = { createTransport };
