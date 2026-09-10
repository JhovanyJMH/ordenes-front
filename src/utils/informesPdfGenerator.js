import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LogoEdoMex from '../images/escudo-edomex.png';
import LogoBienestar from '../images/logo-bienestar_blank.png';

const HEADER_COLOR = [233, 30, 99];
const HEADER_H = 42;
const FOOTER_H = 32;
const M = 10;
const W = 196;

const fmtReportDate = (d) => {
  if (!d) return '';
  const raw = String(d).slice(0, 10);
  const [y, m, day] = raw.split('-').map(Number);
  if (!y || !m || !day) return raw;
  return `${String(day).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
};

const drawHeader = (doc, title, fecini, fecfin) => {
  try {
    doc.addImage(LogoEdoMex, 'PNG', M, 8, 34, 21);
  } catch { /* opcional */ }
  try {
    doc.addImage(LogoBienestar, 'PNG', M + W - 28, 6, 28, 20);
  } catch { /* opcional */ }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('SECRETARIA DE BIENESTAR', M + W / 2, 12, { align: 'center' });
  doc.text('DGDITI', M + W / 2, 17, { align: 'center' });
  doc.setFontSize(7.5);
  const rango = `${fmtReportDate(fecini)} AL ${fmtReportDate(fecfin)}`;
  doc.text(`${title} DEL ${rango}`, M + W / 2, 24, { align: 'center' });
};

const drawSignatures = (doc, pageH, revisor = '', vobo = '') => {
  const y = pageH - FOOTER_H + 4;
  const half = W / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('REVISO', M + half / 2, y, { align: 'center' });
  doc.text('VO.BO.', M + half + half / 2, y, { align: 'center' });
  doc.setDrawColor(0, 0, 0);
  doc.line(M + 8, y + 6, M + half - 8, y + 6);
  doc.line(M + half + 8, y + 6, M + W - 8, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(revisor || 'NOMBRE / FIRMA', M + half / 2, y + 11, { align: 'center' });
  doc.text(vobo || 'NOMBRE / FIRMA', M + half + half / 2, y + 11, { align: 'center' });
};

const drawPageNumber = (doc, pageNum, totalPages) => {
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(`PAGINA: ${pageNum} DE ${totalPages}`, M + W / 2, pageH - 4, { align: 'center' });
};

const generatePagedReport = ({
  filename,
  title,
  fecini,
  fecfin,
  head,
  body,
  foot,
  columnStyles = {},
  revisor = '',
  vobo = '',
}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  autoTable(doc, {
    startY: HEADER_H,
    margin: { top: HEADER_H, bottom: FOOTER_H, left: M, right: M },
    head: [head],
    body,
    foot: foot ? [foot] : undefined,
    showFoot: 'lastPage',
    theme: 'grid',
    headStyles: {
      fillColor: HEADER_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 6.5,
      fontStyle: 'bold',
      textColor: [0, 0, 0],
      valign: 'middle',
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 7,
    },
    columnStyles,
    styles: { cellPadding: 2, overflow: 'linebreak' },
    didDrawPage: () => {
      drawHeader(doc, title, fecini, fecfin);
      drawSignatures(doc, doc.internal.pageSize.getHeight(), revisor, vobo);
    },
  });

  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawPageNumber(doc, i, total);
  }

  doc.save(filename);
};

export const generateResumenSolicitudPdf = (data, fecini, fecfin, user) => {
  const rows = (data.resumen || []).map((r, i) => [
    String(i + 1),
    String(r.servicio || '').toUpperCase(),
    String(r.adscripcion || '').toUpperCase(),
    String(r.atendio || '').toUpperCase(),
    String(r.cantidad ?? ''),
  ]);
  const total = rows.reduce((sum, r) => sum + (Number(r[4]) || 0), 0);

  generatePagedReport({
    filename: `solicitudes-atendidas-${fecini}-${fecfin}.pdf`,
    title: 'SOLICITUDES DE SERVICIO ATENDIDAS',
    fecini,
    fecfin,
    head: ['No.', 'SERVICIO', 'UNIDAD ADMINISTRATIVA', 'ATENDIO', 'CANTIDAD'],
    body: rows,
    foot: ['', '', '', 'TOTAL DE SERVICIOS:', String(total)],
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 52 },
      2: { cellWidth: 68 },
      3: { cellWidth: 38 },
      4: { cellWidth: 18, halign: 'center' },
    },
    revisor: user?.nombre_completo || user?.name || '',
  });
};

export const generateResumenAdscripcionPdf = (data, fecini, fecfin, user) => {
  const rows = (data.resumen || []).map((r, i) => [
    String(i + 1),
    String(r.adscripcion || '').toUpperCase(),
    String(r.cantidad ?? ''),
  ]);
  const total = rows.reduce((sum, r) => sum + (Number(r[2]) || 0), 0);

  generatePagedReport({
    filename: `solicitudes-por-adscripcion-${fecini}-${fecfin}.pdf`,
    title: 'SOLICITUDES DE SERVICIO ATENDIDAS POR ADSCRIPCION',
    fecini,
    fecfin,
    head: ['No.', 'ADSCRIPCION', 'CANTIDAD'],
    body: rows,
    foot: ['', 'TOTAL DE SERVICIOS:', String(total)],
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 152 },
      2: { cellWidth: 20, halign: 'center' },
    },
    revisor: user?.nombre_completo || user?.name || '',
  });
};

export const generateResumenSustantivaPdf = (data, fecini, fecfin, user) => {
  const rows = (data.resumen || []).map((r, i) => [
    String(i + 1),
    String(r.adscripcion || '').toUpperCase(),
    String(r.cantidad ?? ''),
  ]);
  const total = rows.reduce((sum, r) => sum + (Number(r[2]) || 0), 0);

  generatePagedReport({
    filename: `resumen-ua-sustantivas-${fecini}-${fecfin}.pdf`,
    title: 'RESUMEN ACCIONES DE MANTENIMIENTO UA SUSTANTIVAS',
    fecini,
    fecfin,
    head: ['No.', 'ADSCRIPCION', 'CANTIDAD'],
    body: rows,
    foot: ['', 'TOTAL DE SERVICIOS:', String(total)],
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 152 },
      2: { cellWidth: 20, halign: 'center' },
    },
    revisor: user?.nombre_completo || user?.name || '',
    vobo: 'EDUARDO L. CUELLAR SICARD',
  });
};

export const generateServiciosAnualPdf = (data, user) => {
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const anioActual = new Date().getFullYear();
  const fecini = `${anioActual - 1}-01-01`;
  const fecfin = `${anioActual}-12-31`;

  const rows = (data.anual || []).map((r) => [
    String(r.anio),
    meses[(Number(r.mes) || 1) - 1] || String(r.mes),
    String(r.cantidad ?? ''),
  ]);

  generatePagedReport({
    filename: `servicios-anual-${anioActual}.pdf`,
    title: 'RESUMEN ANUAL DE SERVICIOS ATENDIDOS',
    fecini,
    fecfin,
    head: ['AÑO', 'MES', 'CANTIDAD'],
    body: rows,
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
    },
    revisor: user?.nombre_completo || user?.name || '',
  });
};
