const express = require('express');
const path = require('path');
const fs = require('fs');
const Ticket = require('../models/Ticket');
const Report = require('../models/Report');
const User = require('../models/User');
const auth = require('../middlewares/authMiddleware');
const upload = require('../config/upload');
const { buildReportExcel } = require('../services/excel');
const { createTransport } = require('../config/mail');

const router = express.Router();

// Todas requieren auth
router.use(auth);

/** POST /api/tickets/:id/report  (crear reporte, generar excel, mail, cerrar ticket) */
router.post('/tickets/:id/report', upload.array('attachments', 5), async (req, res) => {
  const sessionUserId = req.userId;
  const ticketId = req.params.id;

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });
    if (ticket.status !== 'open') {
      return res.status(400).json({ message: 'El ticket ya no está abierto' });
    }

    const reporter = await User.findById(sessionUserId);
    if (!reporter) return res.status(401).json({ message: 'Usuario no válido' });

    const { content = '' } = req.body;

    // Registrar archivos (si llegan)
    const attachments = (req.files || []).map(f => ({
      filename: f.originalname,
      path: f.path,
      mimetype: f.mimetype,
      size: f.size
    }));

    // 1) Creamos Report
    const report = await Report.create({
      ticketId: ticket._id,
      reporterId: reporter._id,
      content,
      attachments
    });

    // 2) Generar Excel
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    const excelPath = await buildReportExcel({ ticket, report, reporter, uploadsDir });

    // 3) Enviar correo con adjunto
    const transporter = createTransport();
    const mailOptions = {
      from: process.env.REPORT_MAIL_FROM || 'no-reply@localhost',
      to: process.env.REPORT_MAIL_TO || 'admin@localhost',
      subject: `Reporte ticket ${String(ticket._id)} - ${ticket.title}`,
      text: `Se adjunta el reporte del ticket ${String(ticket._id)}. Prioridad: ${ticket.priority}.`,
      attachments: [{ filename: path.basename(excelPath), path: excelPath }]
    };

    await transporter.sendMail(mailOptions);

    // 4) Cerrar ticket globalmente
    ticket.status = 'closed';
    ticket.closedAt = new Date();
    await ticket.save();

    // 5) Guardar ruta excel en Report
    report.excelPath = excelPath;
    await report.save();

    // 6) Registrar en historial solo para reportante (aprovechamos tu modelo/route actual)
    //    Nota: tu History.js espera: ticketId (Number), fecha, hora, dia, contenido, empresa
    //    Simulamos con datos mínimos (ajústalo si tienes layout específico).
    const History = require('../models/History');
    const now = new Date();
    const fecha = now.toLocaleDateString('es-MX');
    const hora = now.toLocaleTimeString('es-MX', { hour12: false });
    const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const dia = dias[now.getDay()];

  await History.create({
        userId: reporter._id,
        ticketId: ticket._id, // <— ObjectId correcto
        fecha,
        hora,
        dia,
        contenido: content || `Reporte de ticket ${ticket.title}`,
        empresa: 'N/A'
      });

    return res.json({
      ok: true,
      message: 'Reporte enviado, ticket cerrado y correo enviado',
      ticketId: ticket._id,
      reportId: report._id
    });
  } catch (err) {
    console.error('Error en reporte:', err);
    return res.status(500).json({ message: 'No se pudo enviar el reporte (correo/excel)' });
  }
});

/** GET /api/reports?mine=true (historial del usuario) */
router.get('/reports', async (req, res) => {
  try {
    const { mine } = req.query;
    const filter = {};
    if (String(mine) === 'true') filter.reporterId = req.userId;

    const reports = await Report.find(filter)
      .populate('ticketId', 'title priority status createdAt')
      .populate('reporterId', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    return res.json(reports);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener reportes' });
  }
});

module.exports = router;
