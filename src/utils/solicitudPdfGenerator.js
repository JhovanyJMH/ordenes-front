import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import LogoEdoMex from '../images/escudo-edomex.png';

const HEADER_COLOR = [245, 71, 110];
const BORDER = [0, 0, 0];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ROW = 5;
const GAP = 5;
const M = 5;
const W = 200;

const fmt = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v).trim();
  if (!s) return '';
  return s.replace(/\\"/g, '"').replace(/\\'/g, "'");
};
const fmtDate = (d) => {
  if (!d) return '';
  const raw = String(d).slice(0, 10);
  const [y, m, day] = raw.split('-').map(Number);
  if (!y || !m || !day) return raw;
  return `${String(day).padStart(2, '0')}-${MONTHS[m - 1]}-${y}`;
};
const fmtTime = (t) => (t ? String(t).slice(0, 5) : '');
const adscripcionLabel = (ads) => (ads ? fmt(ads.descripcion) : '');

const empleadoNombre = (emp) => {
  if (!emp) return '';
  const ap = `${emp.apellidos || ''}`.trim();
  const no = `${emp.nombre || ''}`.trim();
  return `${ap} ${no}`.trim();
};

const userNombre = (user) => {
  if (!user) return '';
  const ap = [user.ap_paterno, user.ap_materno].filter(Boolean).join(' ').trim();
  const no = `${user.name || ''}`.trim();
  if (ap && no) return `${ap} ${no}`;
  return user.nombre_completo || no || ap;
};

const telefonoLabel = (ads) => {
  if (!ads?.telefono) return '';
  return ads.lada ? `${ads.lada}-${ads.telefono}` : ads.telefono;
};

const accionesTexto = (solicitud) => {
  const desc = fmt(solicitud.descripcion_ser);
  const utilizados = fmt(solicitud.utilizados_ser);
  if (desc && utilizados) return `${desc} / SE UTILIZO:${utilizados}`;
  if (utilizados) return `SE UTILIZO:${utilizados}`;
  return desc;
};

const refaccionesTexto = (solicitud) => {
  if (solicitud.refacciones?.length) {
    return solicitud.refacciones
      .map((r) => `${r.descripcion}${r.pivot?.cantidad ? ` (x${r.pivot.cantidad})` : ''}`)
      .join(', ');
  }
  return 'NINGUNA';
};

const drawRow = (doc, x, y, items, h = ROW, alignBottom = false) => {
  let cx = x;
  items.forEach((item) => {
    doc.setDrawColor(...BORDER);
    doc.setFillColor(255, 255, 255);
    doc.rect(cx, y, item.w, h);
    if (item.text !== undefined && item.text !== '') {
      let size = item.size || 8;
      doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      const maxW = item.w - 2;
      let value = String(item.text);
      while (doc.getTextWidth(value) > maxW && size > 6.5) {
        size -= 0.5;
        doc.setFontSize(size);
      }
      if (doc.getTextWidth(value) > maxW) {
        const lines = doc.splitTextToSize(value, maxW);
        value = lines[0];
      }
      const textY = alignBottom ? y + h - 2 : y + h / 2 + 1.1;
      doc.text(value, cx + item.w / 2, textY, { align: 'center' });
    }
    cx += item.w;
  });
  return y + h;
};

const sectionHeader = (doc, x, y, w, text) => {
  doc.setFillColor(...HEADER_COLOR);
  doc.setDrawColor(...BORDER);
  doc.rect(x, y, w, ROW, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(text, x + w / 2, y + 3.5, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  return y + ROW;
};

const textBlock = (doc, x, y, w, h, value, { label, inline } = {}) => {
  doc.setDrawColor(...BORDER);
  doc.rect(x, y, w, h);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const padX = x + 10;
  let ty = y + 4.5;
  if (label && inline) {
    doc.text(label, padX, ty);
    if (fmt(value)) {
      const labelWidth = doc.getTextWidth(label);
      const availableWidth = w - 16 - labelWidth - 6;
      const textValue = fmt(value);
      const lines = doc.splitTextToSize(textValue, availableWidth);
      const maxLines = Math.floor((h - 6) / 4);
      doc.text(lines.slice(0, maxLines), padX + labelWidth + 6, ty);
    }
    return y + h;
  }
  if (label) {
    doc.text(label, padX, ty);
    ty += 5;
  }
  if (fmt(value)) {
    const lines = doc.splitTextToSize(fmt(value), w - 16);
    doc.text(lines.slice(0, Math.max(1, Math.floor((h - (label ? 10 : 6)) / 4))), padX, ty);
  }
  return y + h;
};

const checkboxInCell = (doc, cx, y, w, h, checked, label, filled) => {
  doc.setDrawColor(...BORDER);
  doc.rect(cx, y, w, h);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(label, cx + 4, y + h / 2 + 1.1);
  const box = 3;
  const bx = cx + w - box - 4;
  const by = y + (h - box) / 2;
  doc.setFillColor(255, 255, 255);
  doc.rect(bx, by, box, box, 'S');
  if (checked) {
    if (filled) {
      doc.setFillColor(0, 0, 0);
      doc.rect(bx, by, box, box, 'F');
      doc.setDrawColor(...BORDER);
      doc.rect(bx, by, box, box, 'S');
    } else {
      doc.line(bx + 0.4, by + 1.6, bx + 1.2, by + 2.5);
      doc.line(bx + 1.2, by + 2.5, bx + 2.6, by + 0.5);
    }
  }
};

export const generateSolicitudPdf = async (solicitud) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  doc.setLineWidth(0.2);
  let y = M;
  const emp = solicitud.empleado;
  const eq = solicitud.equipo;
  const hasEquipo = Number(solicitud.indicador_equipo) === 1;
  const solicitante = empleadoNombre(emp) || userNombre(solicitud.user);
  const atendio = userNombre(solicitud.user);
  const eqVal = (v) => (hasEquipo && fmt(v) ? fmt(v) : 'N/A');

  try {
    doc.addImage(LogoEdoMex, 'PNG', M, y, 34, 21);
  } catch {
    /* logo opcional */
  }

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('SECRETARIA DE BIENESTAR', M + W / 2, y + 5, { align: 'center' });
  doc.setFontSize(9);
  doc.text('DGDITI', M + W / 2, y + 10, { align: 'center' });
  doc.setFontSize(10);
  doc.text('SOLICITUD DE SERVICIO', M + W / 2, y + 15, { align: 'center' });
  y += 25;

  y = sectionHeader(doc, M, y, W, '1. REGISTRO DE ACCIONES DE MANTENIMIENTO');
  y = drawRow(doc, M, y, [
    { w: 40, text: 'FECHA:' },
    { w: 30, text: fmtDate(solicitud.fecha) },
    { w: 40, text: 'HORA:' },
    { w: 30, text: fmtTime(solicitud.hora) },
    { w: 30, text: 'FOLIO:' },
    { w: 30, text: solicitud.id, size: 12, bold: true },
  ]);
  y += GAP;

  y = sectionHeader(doc, M, y, W, '1.1 DATOS DEL SOLICITANTE');
  y = drawRow(doc, M, y, [
    { w: 20, text: 'NOMBRE:' },
    { w: 80, text: solicitante },
    { w: 20, text: 'PUESTO:' },
    { w: 80, text: emp?.puesto?.trim() || 'PENDIENTE' },
  ]);
  y = drawRow(doc, M, y, [
    { w: 20, text: 'TELEFONO:' },
    { w: 80, text: telefonoLabel(solicitud.adscripcion) },
    { w: 20, text: 'CORREO:' },
    { w: 80, text: emp?.email || solicitud.user?.email },
  ]);
  y = drawRow(doc, M, y, [
    { w: 60, text: 'UNIDAD ADMINISTRATIVA:' },
    { w: 140, text: adscripcionLabel(solicitud.adscripcion) },
  ]);
  y = textBlock(doc, M, y, W, 20, solicitud.descripcion, { label: 'ACCION SOLICITADA:' });

  y = sectionHeader(doc, M, y, W, '1.1 DATOS DEL EQUIPO (HARDWARE)');
  y += GAP;
  y = drawRow(doc, M, y, [
    { w: 50, text: 'MARCA:' },
    { w: 50, text: 'MODELO:' },
    { w: 50, text: 'SERIE:' },
    { w: 50, text: 'INVENTARIO:' },
  ]);
  y = drawRow(doc, M, y, [
    { w: 50, text: eqVal(eq?.marca) },
    { w: 50, text: eqVal(eq?.modelo) },
    { w: 50, text: eqVal(eq?.serie) },
    { w: 50, text: eqVal(eq?.inventario) },
  ]);
  y = textBlock(doc, M, y, W, 15, eqVal(eq?.descripcion), { label: '' });
  // y = drawRow(doc, M, y, [
  //   { w: 60, text: 'FECHA DE ADQUISICION:' },
  //   { w: 140, text: eqVal(eq?.fecha_adq ? fmtDate(eq?.fecha_adq) : '') },
  // ]);
  // y = drawRow(doc, M, y, [
  //   { w: 60, text: 'UBICACION:' },
  //   { w: 140, text: eqVal(eq?.ubicacion) },
  // ]);
  y = drawRow(doc, M, y, [
    { w: 100, text: 'NOMBRE Y FIRMA DEL USUARIO SOLICITANTE' },
    { w: 100, text: 'NOMBRE Y FIRMA DEL PERSONAL QUE RECIBE LA SOLICITUD' },
  ]);
  y = drawRow(doc, M, y, [
    { w: 100, text: solicitante },
    { w: 100, text: atendio },
  ], 20, true); 

  y = sectionHeader(doc, M, y, W, '2. DIAGNOSTICO');
  y = drawRow(doc, M, y, [
    { w: 25, text: 'FECHA:' },
    { w: 25, text: fmtDate(solicitud.fecha_diag) },
    { w: 25, text: 'HORA:' },
    { w: 25, text: fmtTime(solicitud.hora_diag) },
    { w: 75, text: 'FECHA ESTIMADA DE ENTREGA:' },
    { w: 25, text: fmtDate(solicitud.fecha_diag_entrega) },
  ]);

  const diagBoxY = y;
  doc.setDrawColor(...BORDER);
  doc.rect(M, diagBoxY, W, 20);
  drawRow(doc, M, y, [{ w: 95, text: '¿SOFTWARE iNSTALADO POR LA DGDITI?' }]);
  checkboxInCell(doc, M + 95, y, 35, ROW, Number(solicitud.winoriginal_ser) === 1, 'WINDOWS', false);
  checkboxInCell(doc, M + 130, y, 35, ROW, Number(solicitud.ofioriginal_ser) === 1, 'OFFICE', false);
  checkboxInCell(doc, M + 165, y, 35, ROW, Number(solicitud.licenciamiento_ser) !== 1, 'N/A', true);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const diagLines = doc.splitTextToSize(fmt(solicitud.descripcion_diag), W - 16);
  doc.text(diagLines.slice(0, 3), M + 10, diagBoxY + 9);
  y = diagBoxY + 20;
  y += GAP;

  y = sectionHeader(doc, M, y, W, '3. ACCIONES DE MANTENIMIENTO REALIZADAS');
  y = drawRow(doc, M, y, [
    { w: 40, text: 'FECHA:' },
    { w: 30, text: fmtDate(solicitud.fecha_ser) },
    { w: 40, text: 'HORA:' },
    { w: 30, text: fmtTime(solicitud.hora_ser) },
    { w: 30, text: 'CANTIDAD:' },
    { w: 30, text: solicitud.cantidad_ser ?? '' },
  ]);
  y = drawRow(doc, M, y, [
    { w: 40, text: 'CATEGORIA/SERVICIO:' },
    { w: 160, text: solicitud.servicio?.descripcion },
  ]);
  y = textBlock(doc, M, y, W, 20, accionesTexto(solicitud));
  y = textBlock(doc, M, y, W, 15, refaccionesTexto(solicitud), { label: 'REFACCIONES:', inline: true });

  const evalW = 150;
  const sideW = W - evalW;
  const evalStartY = y;

  y = sectionHeader(doc, M, y, evalW, '4. EVALUACION');
  const evH = 10;
  checkboxInCell(doc, M, y, 40, evH, false, 'MALO', true);
  checkboxInCell(doc, M + 40, y, 35, evH, false, 'REGULAR', true);
  checkboxInCell(doc, M + 75, y, 35, evH, false, 'BUENO', true);
  checkboxInCell(doc, M + 110, y, 40, evH, false, 'EXCELENTE', true);
  y += evH;
  y = drawRow(doc, M, y, [
    { w: 75, text: 'NOMBRE Y FIRMA DE CONFORMIDAD' },
    { w: 75, text: 'NOMBRE Y FIRMA DE QUIEN ATENDIO EL SERVICIO' },
  ]);
  y = drawRow(doc, M, y, [
    { w: 75, text: solicitante },
    { w: 75, text: atendio },
  ], 15, true);

  const sideX = M + evalW;
  const sideH = y - evalStartY;
  doc.setDrawColor(...BORDER);
  doc.rect(sideX, evalStartY, sideW, sideH);

  const qrW = 30;
  const qrH = 27.75;
  const qrX = sideX + 10;
  const qrY = evalStartY + 4;

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const qrUrl = await QRCode.toDataURL(`${origin}/lineamientos.pdf`, { margin: 1, width: 160 });
    doc.addImage(qrUrl, 'PNG', qrX, qrY, qrW, qrH);
  } catch {
    /* qr opcional */
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('LINEAMIENTOS', sideX + 6.9, evalStartY + sideH - 2, { angle: 90 });
  doc.setFont('helvetica', 'normal');
  doc.text('USO BIENES DE TI', sideX + sideW - 4.5, evalStartY + sideH - 2, { angle: 90 });

  doc.save(`Solicitud_TI_${solicitud.id}.pdf`);
};

export const downloadSolicitudPdf = async (id, getSolicitudById) => {
  const solicitud = await getSolicitudById(id);
  await generateSolicitudPdf(solicitud);
};
