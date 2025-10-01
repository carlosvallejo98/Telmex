const { Schema, model, Types } = require('mongoose');

const HistorySchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    ticketId: { type: Types.ObjectId, ref: 'Ticket', required: true },
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
    dia: { type: String, required: true },
    contenido: { type: String, required: true },
    empresa: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = model('History', HistorySchema);
