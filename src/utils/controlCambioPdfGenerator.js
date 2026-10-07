import jsPDF from 'jspdf';
import LogoEdoMex from '../images/Recurso 6.png';
import LogoDGDITI from '../images/recurso5.png';
import LogoFooter from '../images/recurso4.png';

const FONT = 'times';
const pad = (value) => (value === null || value === undefined ? '' : String(value).trim());
const isChecked = (value) => value === true || value === 1 || value === '1' || value === 'true';
const fmtDate = (value) => {
  if (!value) return '';
  const str = String(value).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return str;
};

const personName = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  const nombre = value.nombre || value.name || '';
  const apellidos = value.apellidos || [value.ap_paterno, value.ap_materno].filter(Boolean).join(' ');
  return `${nombre} ${apellidos}`.trim() || value.nombre_completo || '';
};

const sameText = (value, expected) => String(value || '').normalize('NFC').toLowerCase() === String(expected || '').normalize('NFC').toLowerCase();

export const buildControlCambioData = (data = {}) => {
  const raw = data && typeof data === 'object' && 'data' in data && !('fecha_solicitud' in data) && !('nombre_sistema' in data)
    ? data.data
    : data;
  const source = raw || {};

  return {
    fechaSolicitud: fmtDate(source.fecha_solicitud),
    respaldoOficio: isChecked(source.respaldo_oficio),
    respaldoCorreo: isChecked(source.respaldo_correo),
    respaldoMinuta: isChecked(source.respaldo_minuta),
    respaldoPruebas: isChecked(source.respaldo_pruebas),
    nombreSistema: pad(source.nombre_sistema),
    descripcionSolicitud: pad(source.descripcion_solicitud),
    modulo: pad(source.modulo_funcionalidad),
    usuariosAfectados: pad(source.usuarios_afectados),
    justificacion: pad(source.justificacion),
    areaSolicitante: pad(source.area_solicitante),
    solicitante: personName(source.solicitante_nombre || source.solicitante),
    numeroControl: pad(source.numero_control),
    ambientePruebas: isChecked(source.ambiente_pruebas),
    ambienteProductivo: isChecked(source.ambiente_productivo),
    impacto: pad(source.impacto),
    prioridad: pad(source.prioridad),
    tipoCambio: pad(source.tipo_cambio),
    clasificacionFrontend: isChecked(source.clasificacion_frontend),
    clasificacionBackend: isChecked(source.clasificacion_backend),
    clasificacionBd: isChecked(source.clasificacion_bd),
    clasificacionInfra: isChecked(source.clasificacion_infraestructura),
    fechaAnalisis: fmtDate(source.fecha_analisis),
    elementosAfectados: pad(source.elementos_afectados),
    cambiosMenores: isChecked(source.cambios_menores),
    cambiosMayores: isChecked(source.cambios_mayores),
    descripcionImpacto: pad(source.descripcion_impacto),
    alcance: pad(source.alcance),
    fechaDesarrollo: fmtDate(source.fecha_desarrollo),
    responsableDesarrollo: personName(source.responsable_desarrollo || source.responsableDesarrollo),
    solucion: pad(source.solucion),
    revisiones: pad(source.revisiones),
    fechaPruebas: fmtDate(source.fecha_pruebas),
    responsablePruebas: personName(source.responsable_pruebas),
    observacionesPruebas: pad(source.observaciones_pruebas),
    fechaAutorizacion: fmtDate(source.fecha_autorizacion),
    responsableAutorizacion: personName(source.responsable_autorizacion),
    observacionesAutorizacion: pad(source.observaciones_autorizacion),
    fechaProduccion: fmtDate(source.fecha_produccion),
    responsableProduccion: personName(source.responsable_produccion),
    resultadoImplementacion: pad(source.resultado_implementacion),
    observacionesProduccion: pad(source.observaciones_produccion),
    firmanteArea: pad(source.firmante_area_solicitante) || personName(source.solicitante_nombre || source.solicitante),
    cargoArea: pad(source.cargo_area_solicitante) || 'Subdirector de Bienestar y Recreacion Juvenil',
    firmanteDesarrollo: pad(source.firmante_desarrollo) || personName(source.responsable_desarrollo),
    cargoDesarrollo: pad(source.cargo_desarrollo) || 'Subdirectora de Desarrollo de Software y Bases de Datos',
    firmanteDirector: pad(source.firmante_director),
    cargoDirector: pad(source.cargo_director) || 'Director de la Direccion General de Desarrollo Institucional y Tecnologias de la Informacion',
  };
};

const M = 15;
const W = 186;
const BURGUNDY = [128, 0, 0];
const BORDER = [0, 0, 0];
const ROW = 6.5;
const PAGE_BOTTOM = 248;

const header = (doc) => {
  doc.setDrawColor(...BORDER);
  doc.rect(M, 8, W, 28, 'S');
  doc.line(M + 52, 8, M + 52, 36);
  doc.line(M + 148, 8, M + 148, 36);
  try { doc.addImage(LogoEdoMex, 'PNG', M + 2, 13, 45, 17); } catch { /* opcional */ }
  try { doc.addImage(LogoDGDITI, 'PNG', M + W - 37, 13, 34, 17); } catch { /* opcional */ }
  doc.setTextColor(0, 0, 0);
  doc.setFont(FONT, 'bold');
  doc.setFontSize(11);
  doc.text('FORMATO', 110, 18, { align: 'center' });
  doc.text('Control de Cambios', 110, 25, { align: 'center' });
};

const footer = (doc) => {
  try { doc.addImage(LogoFooter, 'PNG', M, 257, 29, 20); } catch { /* opcional */ }
  doc.setDrawColor(90, 90, 90);
  doc.setLineWidth(1.2);
  doc.line(M + 10, 256, M + W, 256);
  doc.setLineWidth(0.2);
  doc.setTextColor(0, 0, 0);
  doc.setFont(FONT, 'bold');
  doc.setFontSize(8);
  doc.text('Direccion General de Desarrollo Institucional y Tecnologias de la Informacion', M + 70, 263);
  doc.text('Subdireccion de Desarrollo de Software y Base de Datos', M + 70, 269);
};

const checkbox = (doc, x, y, checked) => {
  doc.setDrawColor(...BORDER);
  doc.rect(x, y, 3.5, 3.5, 'S');
  if (checked) {
    doc.line(x + 0.4, y + 1.8, x + 1.3, y + 2.8);
    doc.line(x + 1.3, y + 2.8, x + 3.1, y + 0.6);
  }
};

const titleBlock = (doc, y, label) => {
  doc.setFillColor(...BURGUNDY);
  doc.setDrawColor(...BORDER);
  doc.rect(M, y, W, ROW, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.setFont(FONT, 'bold');
  doc.setFontSize(10);
  doc.text(label, M + W / 2, y + 4.6, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  return y + ROW;
};

const drawRow = (doc, y, cols, h = ROW) => {
  let x = M;
  cols.forEach((col) => {
    doc.setDrawColor(...BORDER);
    doc.rect(x, y, col.w, h, 'S');
    doc.setFont(FONT, col.bold ? 'bold' : 'normal');
    doc.setFontSize(col.size || 9);
    if (col.text !== undefined) {
      const lines = doc.splitTextToSize(pad(col.text) || ' ', col.w - 4);
      doc.text(lines.slice(0, Math.max(1, Math.floor((h - 2) / 3.5))), x + 2, y + 4.4);
    }
    x += col.w;
  });
};

const textBlock = (doc, y, label, value, minH = 14) => {
  const lines = doc.splitTextToSize(pad(value) || ' ', W - 6);
  const h = Math.max(minH, 8 + lines.length * 3.6);
  doc.setDrawColor(...BORDER);
  doc.rect(M, y, W, h, 'S');
  doc.setFont(FONT, 'bold');
  doc.setFontSize(8);
  doc.text(label, M + 2, y + 4);
  doc.setFont(FONT, 'normal');
  doc.setFontSize(9);
  doc.text(lines, M + 2, y + 8.5);
  return y + h;
};

const optionRow = (doc, y, label, options) => {
  const h = options.length > 3 ? 12 : ROW;
  drawRow(doc, y, [{ w: 46, text: label, bold: true }, { w: W - 46, text: '' }], h);
  const cols = options.length > 3 ? 3 : options.length;
  options.forEach((opt, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cellW = (W - 46) / cols;
    const x = M + 46 + col * cellW;
    const cy = y + 1.6 + row * 5.4;
    checkbox(doc, x + 2, cy, opt.checked);
    doc.setFont(FONT, 'normal');
    doc.setFontSize(8);
    doc.text(opt.label, x + 7, cy + 2.7);
  });
  return y + h;
};

const stageBlock = (doc, y, title, fecha, responsable) => {
  y = titleBlock(doc, y, title);
  drawRow(doc, y, [
    { w: 22, text: 'Fecha', bold: true }, { w: 28, text: fecha },
    { w: 42, text: 'Responsable', bold: true }, { w: 52, text: responsable },
    { w: 18, text: 'Firma', bold: true }, { w: 24, text: '' },
  ], 9);
  return y + 9;
};

export const generateControlCambioPdf = (fichaData, fileName = 'control-de-cambios.pdf') => {
  const ficha = fichaData;
  const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });

  const addPage = () => {
    footer(doc);
    doc.addPage();
    header(doc);
    return 40;
  };

  const ensure = (y, h) => (y + h > PAGE_BOTTOM ? addPage() : y);

  header(doc);
  let y = 40;
  doc.setFont(FONT, 'bold');
  doc.setFontSize(13);
  doc.text('Formato de Control de Cambios', M + W / 2, y + 5, { align: 'center' });
  y += 10;

  y = titleBlock(doc, y, 'Solicitud');
  drawRow(doc, y, [
    { w: 50, text: 'Fecha de Solicitud', bold: true },
    { w: W - 50, text: ficha.fechaSolicitud },
  ]);
  y += ROW;
  y = ensure(y, 16);
  drawRow(doc, y, [{
    w: W,
    text: 'La presente solicitud debera ser requisitada por la unidad administrativa usuaria responsable del sistema o proceso afectado.',
  }], 10);
  y += 10;
  y = optionRow(doc, y, 'Documento de respaldo', [
    { label: 'Oficio formal de solicitud', checked: ficha.respaldoOficio },
    { label: 'Correo institucional de solicitud', checked: ficha.respaldoCorreo },
    { label: 'Minuta de reunion autorizada', checked: ficha.respaldoMinuta },
    { label: 'Evidencia de pruebas realizadas', checked: ficha.respaldoPruebas },
  ]);
  y = ensure(y, 10);
  drawRow(doc, y, [{ w: 42, text: 'Sistema', bold: true }, { w: W - 42, text: ficha.nombreSistema }]);
  y += ROW;
  y = ensure(y, 22);
  y = textBlock(doc, y, 'Descripcion de la solicitud:', ficha.descripcionSolicitud, 16);
  y = ensure(y, 10);
  drawRow(doc, y, [{ w: 50, text: 'Modulo / Funcionalidad', bold: true }, { w: W - 50, text: ficha.modulo }]);
  y += ROW;
  y = ensure(y, 16);
  y = textBlock(doc, y, 'Usuarios afectados:', ficha.usuariosAfectados, 12);
  y = ensure(y, 16);
  y = textBlock(doc, y, 'Justificacion:', ficha.justificacion, 12);
  y = ensure(y, 13);
  drawRow(doc, y, [
    { w: 42, text: 'Area Solicitante', bold: true }, { w: 51, text: ficha.areaSolicitante },
    { w: 50, text: 'Nombre y firma del solicitante', bold: true, size: 8 }, { w: 43, text: ficha.solicitante },
  ], 10);
  y += 12;

  y = ensure(y, 52);
  y = titleBlock(doc, y, 'Cambio requerido');
  drawRow(doc, y, [
    { w: 50, text: 'Numero de control', bold: true },
    { w: W - 50, text: ficha.numeroControl },
  ]);
  y += ROW;
  y = optionRow(doc, y, 'Ambiente', [
    { label: 'Ambiente Pruebas', checked: ficha.ambientePruebas },
    { label: 'Ambiente Productivo', checked: ficha.ambienteProductivo },
  ]);
  y = optionRow(doc, y, 'Impacto', [
    { label: 'Critico', checked: sameText(ficha.impacto, 'Critico') || sameText(ficha.impacto, 'Critico') },
    { label: 'Moderado', checked: sameText(ficha.impacto, 'Moderado') },
    { label: 'Bajo', checked: sameText(ficha.impacto, 'Bajo') },
  ]);
  y = optionRow(doc, y, 'Prioridad', [
    { label: 'Alta', checked: sameText(ficha.prioridad, 'Alta') },
    { label: 'Media', checked: sameText(ficha.prioridad, 'Media') },
    { label: 'Baja', checked: sameText(ficha.prioridad, 'Baja') },
  ]);
  y = optionRow(doc, y, 'Tipo de Cambio', [
    { label: 'Correctivo', checked: sameText(ficha.tipoCambio, 'Correctivo') },
    { label: 'Preventivo', checked: sameText(ficha.tipoCambio, 'Preventivo') },
    { label: 'Evolutivo', checked: sameText(ficha.tipoCambio, 'Evolutivo') },
    { label: 'Adaptativo', checked: sameText(ficha.tipoCambio, 'Adaptativo') },
    { label: 'Mejora Funcional', checked: sameText(ficha.tipoCambio, 'Mejora Funcional') },
  ]);
  y = optionRow(doc, y, 'Clasificacion adicional', [
    { label: 'Frontend', checked: ficha.clasificacionFrontend },
    { label: 'Backend', checked: ficha.clasificacionBackend },
    { label: 'Base de Datos', checked: ficha.clasificacionBd },
    { label: 'Infraestructura / Servidor', checked: ficha.clasificacionInfra },
  ]);

  y = ensure(y, 40);
  y = titleBlock(doc, y, 'Analisis de Impacto');
  drawRow(doc, y, [
    { w: 22, text: 'Fecha', bold: true }, { w: 28, text: ficha.fechaAnalisis },
    { w: 42, text: 'Elementos afectados', bold: true }, { w: 40, text: ficha.elementosAfectados },
    { w: 28, text: 'Cambios menores', bold: true, size: 8 }, { w: 26, text: '' },
  ]);
  checkbox(doc, M + 160 + 8, y + 1.6, ficha.cambiosMenores);
  y += ROW;
  drawRow(doc, y, [{ w: W - 26, text: 'Cambios mayores', bold: true }, { w: 26, text: '' }]);
  checkbox(doc, M + W - 18, y + 1.6, ficha.cambiosMayores);
  y += ROW;
  y = ensure(y, 16);
  y = textBlock(doc, y, 'Descripcion:', ficha.descripcionImpacto, 14);
  y = ensure(y, 16);
  y = textBlock(doc, y, 'Alcance:', ficha.alcance, 14);

  y = ensure(y, 42);
  y = titleBlock(doc, y, 'Historial de Implementacion');
  y = ensure(y, 28);
  y = stageBlock(doc, y, 'Aplicacion del cambio en Ambiente de Desarrollo', ficha.fechaDesarrollo, ficha.responsableDesarrollo);
  y = ensure(y, 16);
  y = textBlock(doc, y, 'Solucion:', ficha.solucion, 14);
  y = ensure(y, 14);
  y = textBlock(doc, y, 'Revisiones:', ficha.revisiones, 12);

  y = ensure(y, 36);
  y = stageBlock(doc, y, 'Aplicacion del cambio en Ambiente de Pruebas', ficha.fechaPruebas, ficha.responsablePruebas);
  y = textBlock(doc, y, 'Observaciones:', ficha.observacionesPruebas, 12);

  y = ensure(y, 36);
  y = stageBlock(doc, y, 'Autorizacion para liberacion a Produccion', ficha.fechaAutorizacion, ficha.responsableAutorizacion);
  y = textBlock(doc, y, 'Observaciones:', ficha.observacionesAutorizacion, 12);

  y = ensure(y, 42);
  y = stageBlock(doc, y, 'Aplicacion de cambios en Ambiente Productivo', ficha.fechaProduccion, ficha.responsableProduccion);
  y = textBlock(doc, y, 'Resultado de implementacion:', ficha.resultadoImplementacion, 12);
  y = ensure(y, 14);
  y = textBlock(doc, y, 'Observaciones:', ficha.observacionesProduccion, 12);

  y = ensure(y, 62);
  y = titleBlock(doc, y, 'Respaldo documental segun alcance');
  const notes = [
    'Dependiendo del alcance e impacto del cambio solicitado, debera integrarse como respaldo documental:',
    'Cambios menores: Solicitud formal, Orden de Servicio y Registro en Control de Cambios.',
    'Cambios mayores: Solicitud formal, Pruebas funcionales, Minuta de Reunion, Orden de Servicio, Documento de Aceptacion y Registro en Control de Cambios.',
    'La Orden de Servicio servira como respaldo formal de la atencion realizada, mientras que el Documento de Aceptacion validara la conformidad del Area Solicitante en cambios de mayor impacto.',
  ];
  const noteLines = doc.splitTextToSize(notes.join('\n'), W - 6);
  const noteH = 8 + noteLines.length * 3.6;
  doc.rect(M, y, W, noteH, 'S');
  doc.setFont(FONT, 'normal');
  doc.setFontSize(8);
  doc.text(noteLines, M + 2, y + 4.5);
  y += noteH + 8;

  y = ensure(y, 52);
  doc.setFont(FONT, 'bold');
  doc.setFontSize(9);
  doc.text('Nombre y Firma', 55, y, { align: 'center' });
  doc.text('Nombre y Firma', 155, y, { align: 'center' });
  doc.setFont(FONT, 'normal');
  const drawNameAboveLine = (name, center, width, lineY) => {
    const text = name || '';
    const textWidth = doc.getTextWidth(text);
    const fontSize = textWidth > width ? 9 * width / textWidth : 9;
    doc.setFontSize(fontSize);
    doc.text(text || ' ', center, lineY - 1, { align: 'center' });
    doc.setFontSize(9);
  };
  drawNameAboveLine(ficha.firmanteArea, 55, 70, y + 11);
  drawNameAboveLine(ficha.firmanteDesarrollo, 155, 76, y + 11);
  doc.line(M + 10, y + 11, M + 80, y + 11);
  doc.line(M + 110, y + 11, M + W, y + 11);
  doc.setFontSize(8);
  doc.text('Area Solicitante', 55, y + 16, { align: 'center' });
  doc.text('Responsable de Desarrollo', 155, y + 16, { align: 'center' });
  doc.text(doc.splitTextToSize(ficha.cargoArea, 70), 55, y + 20, { align: 'center' });
  doc.text(doc.splitTextToSize(ficha.cargoDesarrollo, 70), 155, y + 20, { align: 'center' });
  y += 36;
  doc.setFont(FONT, 'bold');
  doc.setFontSize(9);
  doc.text('Nombre y Firma', M + W / 2, y, { align: 'center' });
  doc.setFont(FONT, 'normal');
  drawNameAboveLine(ficha.firmanteDirector, M + W / 2, 86, y + 11);
  doc.line(M + 50, y + 11, M + W - 50, y + 11);
  doc.setFontSize(8);
  doc.text(doc.splitTextToSize(ficha.cargoDirector, 120), M + W / 2, y + 16, { align: 'center' });

  footer(doc);
  doc.save(fileName);
  return doc;
};

export default { buildControlCambioData, generateControlCambioPdf };
