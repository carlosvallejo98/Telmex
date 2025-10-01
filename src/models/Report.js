const { Schema, model, Types } = require('mongoose');

const ReportSchema = new Schema(
  {
    ticketId: { type: Types.ObjectId, ref: 'Ticket', required: true },
    reporterId: { type: Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    excelPath: { type: String, default: '' },
    attachments: [{
      filename: String,
      path: String,
      mimetype: String,
      size: Number
    }]
  },
  { timestamps: true }
);

module.exports = model('Report', ReportSchema);
