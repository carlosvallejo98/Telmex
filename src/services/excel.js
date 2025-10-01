const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function buildReportExcel({ ticket, report, reporter, uploadsDir }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Reporte');

  // Definir columnas estilo imagen oficial
  ws.columns = [
    { header: '', key: 'a', width: 8 },
    { header: 'NV', key: 'nv', width: 14 },
    { header: 'FECHA', key: 'fecha', width: 14 },
    { header: 'HORA LOCAL', key: 'hora', width: 14 },
    { header: 'ID', key: 'idc', width: 18 },
    { header: 'CLIENTE', key: 'cliente', width: 36 },
    { header: 'SITIO', key: 'sitio', width: 34 },
    { header: 'DIRECCIÓN', key: 'direccion', width: 40 },
    { header: 'NOMBRE DEL CONTACTO', key: 'contacto', width: 22 },
    { header: 'TELÉFONO DEL CONTACTO', key: 'telefono', width: 18 },
    { header: 'ACTIVIDAD', key: 'actividad', width: 22 },
    { header: '', key: 'z', width: 6 },
  ];

  const blueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF193B63' } };
  const whiteFont = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Espaciado superior
  ws.addRow([]);
  ws.addRow([]);

  // Encabezado azul
  const headerRow = ws.addRow([
    '',
    'NV',
    'FECHA',
    'HORA LOCAL',
    'ID',
    'CLIENTE',
    'SITIO',
    'DIRECCIÓN',
    'NOMBRE DEL CONTACTO',
    'TELÉFONO DEL CONTACTO',
    'ACTIVIDAD',
    '',
  ]);

  headerRow.eachCell((cell) => {
    cell.fill = blueFill;
    cell.font = whiteFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
  });

  // Preparar datos desde ticket
  const dataRow = ws.addRow([
    '',
    safe(ticket.NV),
    formatDate(ticket.fecha || ticket.createdAt),
    safe(ticket.horaLocal),
    safe(ticket.ID || ticket._id),
    safe(ticket.cliente),
    safe(ticket.sitio),
    buildAddress(ticket),
    safe(ticket.contacto),
    safe(ticket.telefono),
    safe(ticket.actividad),
    '',
  ]);

  dataRow.eachCell((cell, col) => {
    cell.alignment = {
      vertical: 'top',
      horizontal: col === 8 ? 'left' : 'center',
      wrapText: col === 8, // Dirección con saltos de línea
    };
    cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
    if (col === 6 || col === 7) cell.font = { bold: true }; // Cliente/Sitio en negritas
  });

  // Footer con saludo
  ws.addRow([]);
  const footer = ws.addRow(['', '', '', '', '', '', '', '', '', '', '', '']);
  footer.getCell(2).value = 'Quedo atento a sus comentarios, saludos.';
  footer.getCell(2).alignment = { horizontal: 'left' };

  headerRow.height = 30;
  dataRow.height = 70;
  footer.height = 30;

  // Guardar en /uploads/reports
  const reportsDir = path.join(uploadsDir, 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const filename = `reporte_${String(ticket._id)}_${Date.now()}.xlsx`;
  const outPath = path.join(reportsDir, filename);
  await wb.xlsx.writeFile(outPath);

  return outPath;
}

// Helpers
function safe(val) {
  return val ? String(val) : '';
}
function formatDate(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return String(dt);
  return d.toLocaleDateString('es-MX');
}
function buildAddress(t) {
  const lines = [];
  if (t.direccion) lines.push(t.direccion);
  if (t.calle) lines.push(`Calle: ${t.calle}`);
  if (t.numeroExterior) lines.push(`Número Exterior: ${t.numeroExterior}`);
  if (t.numeroInterior) lines.push(`Número Interior: ${t.numeroInterior}`);
  if (t.piso) lines.push(`Piso: ${t.piso}`);
  if (t.colonia) lines.push(`Colonia: ${t.colonia}`);
  if (t.entreCalles) lines.push(`Entre Calles: ${t.entreCalles}`);
  if (t.delegacion || t.municipio) lines.push(`Delegación o Municipio: ${t.delegacion || t.municipio}`);
  if (t.cp) lines.push(`C.P.: ${t.cp}`);
  if (t.ciudad) lines.push(`Ciudad: ${t.ciudad}`);
  if (t.estado) lines.push(`Estado: ${t.estado}`);
  return lines.join('\n');
}

module.exports = { buildReportExcel };
