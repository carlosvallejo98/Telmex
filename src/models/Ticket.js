// models/Ticket.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['normal', 'urgent'], default: 'normal' },
  status: { type: String, enum: ['open', 'in_progress', 'reported', 'closed'], default: 'open' },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 👉 Visibilidad por ingeniero (OBLIGATORIO)
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 👉 Campos usados por tu Excel/correo (no invento nombres nuevos)
  NV: { type: String, default: '' },
  ID: { type: String, default: '' },   // si en tu repo ya usas 'idc', mantenlo también
  cliente: { type: String, default: '' },
  sitio: { type: String, default: '' },
  direccion: { type: String, default: '' },
  contacto: { type: String, default: '' },
  telefono: { type: String, default: '' },
  actividad: { type: String, default: '' },
}, { timestamps: true });

TicketSchema.index({ assignedTo: 1, status: 1, priority: 1, createdAt: -1 });

module.exports = mongoose.model('Ticket', TicketSchema);
