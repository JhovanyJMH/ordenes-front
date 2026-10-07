import jsPDF from 'jspdf';
import LogoEdoMex from '../images/Recurso 6.png';
import LogoDGDITI from '../images/recurso5.png';
import LogoFooter from '../images/recurso4.png';

const pad = (value) => (value === null || value === undefined ? '' : String(value).trim());
const fmtDate = (value) => {
  if (!value) return '';
  const str = String(value).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return str;
};

export const buildLiberacionFichaData = (data = {}) => {
  if (
    data
    && typeof data === 'object'
    && data.general
    && Array.isArray(data.entregables)
    && data.validacion
    && data.responsables
  ) {
    return data;
  }

  const raw = data && typeof data === 'object' && 'data' in data && !('fecha_solicitud' in data) && !('nombre_sistema' in data) ? data.data : data;
  const source = raw || {};

  const empleadoNombre = (empleado) => {
    if (!empleado) return '';
    if (typeof empleado === 'string') return empleado;
    if (empleado.nombre_completo || empleado.nombreCompleto) {
      return empleado.nombre_completo || empleado.nombreCompleto;
    }
    const nombre = empleado.nombre || empleado.name || '';
    const apellidos = empleado.apellidos || [empleado.ap_paterno, empleado.ap_materno].filter(Boolean).join(' ');
    return `${nombre} ${apellidos}`.trim() || empleado.email || `Empleado #${empleado.id || ''}`;
  };

  const firstValue = (...values) => values.find((value) => value !== null && value !== undefined && value !== '') ?? '';

  const ambientes = [
    source.ambiente_pruebas ? 'Pruebas' : '',
    source.ambiente_produccion ? 'Producción' : '',
  ].filter(Boolean);

  const tipoLiberacion =
    firstValue(source.tipo_liberacion, source.tipoLiberacion) ||
    (source.tipo_liberacion_nueva_version ? 'Nueva versión' : '') ||
    (source.tipo_liberacion_correccion ? 'Corrección' : '') ||
    (source.tipo_liberacion_mejora ? 'Mejora' : '');

  const prioridad =
    firstValue(source.prioridad) ||
    (source.prioridad_alta ? 'Alta' : '') ||
    (source.prioridad_media ? 'Media' : '') ||
    (source.prioridad_baja ? 'Baja' : '');

  return {
    general: {
      numeroControl: pad(firstValue(source.numero_control, source.numeroControl)),
      fechaSolicitud: fmtDate(firstValue(source.fecha_solicitud, source.fechaSolicitud)),
      fechaLiberacion: fmtDate(firstValue(source.fecha_liberacion, source.fechaLiberacion)),
      liderProyecto: empleadoNombre(firstValue(
        source.lider_proyecto_data,
        source.lider_proyecto,
        source.liderProyecto,
        source.lider_proyecto_nombre,
      )),
      nombreSistema: pad(firstValue(source.nombre_sistema, source.nombreSistema)),
      version: pad(firstValue(source.version)),
      ambientes,
      tipoLiberacion,
      prioridad,
    },
    entregables: [
      {
        nombre: 'Frontend',
        incluye: 'Archivos compilados / proyecto frontend',
        ruta: pad(source.f_ruta),
        estado: pad(source.entregable_frontend_estado),
      },
      {
        nombre: 'Backend',
        incluye: 'API / servicios / lógica de negocio',
        ruta: pad(source.b_ruta),
        estado: pad(source.entregable_backend_estado),
      },
      {
        nombre: 'Base de Datos',
        incluye: 'Scripts SQL / migraciones',
        ruta: pad(source.bd_ruta),
        estado: pad(source.entregable_bd_estado),
      },
      {
        nombre: 'Variables de entorno',
        incluye: 'Variables .env o plantilla de variables necesarias para la operación del sistema.',
        ruta: pad(source.var_entorno),
        estado: pad(source.entregable_variables_estado),
      },
    ],
    validacion: {
      pruebasResponsable: 'Desarrollo',
      pruebasResultado: pad(source.validacion_pruebas_resultado),
      usuarioResponsable: 'Área usuaria',
      usuarioResultado: pad(source.validacion_acceso_resultado),
      observaciones: pad(source.observaciones_finales),
    },
    responsables: {
      firmaInfraestructura: pad(firstValue(empleadoNombre(source.responsable_infraestructura || source.responsableInfraestructura), 'Ing. Javier Beltrán Salgado')),
      firmaDesarrollo: pad(firstValue(empleadoNombre(source.responsable_desarrollo || source.responsableDesarrollo), 'Ing. Julieta Díaz Vega')),
      cargoInfraestructura: pad(firstValue(
        source.cargo_infraestructura,
        'Subdirector de Operaciones, Seguridad y Proyectos Tecnológicos',
      )),
      cargoDesarrollo: pad(firstValue(
        source.cargo_desarrollo,
        'Subdirectora de Desarrollo de Software y Bases de Datos',
      )),
    },
  };
};

const M = 15;
const W = 186;
const BURGUNDY = [128, 0, 0];
const BORDER = [0, 0, 0];
const ROW = 6.5;

const header = (doc) => {
  doc.setDrawColor(...BORDER);
  doc.rect(M, 8, W, 28, 'S');
  doc.line(M + 52, 8, M + 52, 36);
  doc.line(M + 148, 8, M + 148, 36);

  try {
    doc.addImage(LogoEdoMex, 'PNG', M + 2, 13, 45, 17);
  } catch {
    // logo opcional
  }

  try {
    doc.addImage(LogoDGDITI, 'PNG', M + W - 37, 13, 34, 17);
  } catch {
    // logo opcional
  }

  doc.setTextColor(0, 0, 0);
  doc.setFont('arial', 'bold');
  doc.setFontSize(11);
  doc.text('FORMATO', 110, 18, { align: 'center' });
  doc.setFontSize(11);
  doc.text('Liberación de Aplicativos', 110, 25, { align: 'center' });
};

const footer = (doc) => {
  try {
    doc.addImage(LogoFooter, 'PNG', M, 257, 29, 20);
  } catch {
    // logo opcional
  }
  doc.setDrawColor(90, 90, 90);
  doc.setLineWidth(1.2);
  doc.line(M + 10, 256, M + W, 256);
  doc.setLineWidth(0.2);
  doc.setTextColor(0, 0, 0);
  doc.setFont('arial', 'bold');
  doc.setFontSize(9);
  doc.text('Dirección General de Desarrollo Institucional y Tecnologías de la Información', M + 70, 263, { align: 'left' });
  doc.text('Subdirección de Desarrollo de Software y Base de Datos', M + 70, 269, { align: 'left' });
};

const titleBlock = (doc, y, label) => {
  doc.setFillColor(...BURGUNDY);
  doc.setDrawColor(...BORDER);
  doc.rect(M, y, W, ROW, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.setFont('arial', 'bold');
  doc.setFontSize(11);
  doc.text(label, M + W / 2, y + 5.5, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  return y + ROW;
};

const drawRow = (doc, y, cols, h = ROW) => {
  let x = M;
  cols.forEach((col) => {
    doc.setDrawColor(...BORDER);
    doc.rect(x, y, col.w, h, 'S');
    doc.setFont('arial', col.bold ? 'bold' : 'normal');
    doc.setFontSize(col.size || 11);
    if (col.text !== undefined) {
      const value = pad(col.text);
      const lines = doc.splitTextToSize(value || ' ', col.w - 4);
      doc.text(lines.slice(0, Math.max(1, Math.floor(h / 4))), x + 2, y + 5.5);
    }
    x += col.w;
  });
};

const checkbox = (doc, x, y, checked) => {
  doc.setDrawColor(...BORDER);
  doc.rect(x, y, 3.5, 3.5, 'S');
  if (checked) {
    doc.line(x + 0.4, y + 1.8, x + 1.3, y + 2.8);
    doc.line(x + 1.3, y + 2.8, x + 3.1, y + 0.6);
  }
};

const optionRow = (doc, y, label, options, selected) => {
  drawRow(doc, y, [{ w: 42, text: label, bold: true }], ROW);
  let x = M + 42;
  options.forEach((option) => {
    const w = (W - 42) / options.length;
    doc.rect(x, y, w, ROW, 'S');
    doc.setFont('arial', 'normal');
    doc.setFontSize(11);
    doc.text(option, x + w - 16, y + 5.5, { align: 'right' });
    checkbox(doc, x + w - 12, y + 2.2, String(selected || '').toLowerCase() === option.toLowerCase());
    x += w;
  });
};

const textRow = (doc, y, label, value, labelWidth = 42) => {
  drawRow(doc, y, [{ w: labelWidth, text: label, bold: true }, { w: W - labelWidth, text: value }]);
};

const checkboxOptionRow = (doc, y, label, options, selectedOptions, labelWidth = 42) => {
  drawRow(doc, y, [{ w: labelWidth, text: label, bold: true }], ROW);
  const optionWidth = (W - labelWidth) / options.length;
  options.forEach((option, index) => {
    const x = M + labelWidth + optionWidth * index;
    doc.rect(x, y, optionWidth, ROW, 'S');
    doc.setFont('arial', 'normal');
    doc.setFontSize(10);
    doc.text(option, x + optionWidth - 16, y + 5.5, { align: 'right' });
    checkbox(doc, x + optionWidth - 12, y + 2.2, selectedOptions.includes(option));
  });
};

export const generateLiberacionFichaPdf = (fichaData, fileName = 'ficha-liberacion.pdf') => {
  const ficha = buildLiberacionFichaData(fichaData);
  const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
  const selected = (value, expected) => String(value || '').toLowerCase() === expected.toLowerCase();
  const burgundyRow = (y, columns, h = ROW) => {
    let x = M;
    doc.setTextColor(255, 255, 255);
    columns.forEach(({ w, text }) => {
      doc.setFillColor(...BURGUNDY);
      doc.setDrawColor(...BORDER);
      doc.rect(x, y, w, h, 'F');
      doc.rect(x, y, w, h, 'S');
      doc.setFont('arial', 'bold');
      doc.setFontSize(11);
      doc.text(text, x + w / 2, y + 5.5, { align: 'center' });
      x += w;
    });
    doc.setTextColor(0, 0, 0);
  };

  const drawPageOne = () => {
    header(doc);
    let y = 40;
    doc.setFont('arial', 'bold');
    doc.setFontSize(14);
    doc.text('Formato de Solicitud de Liberación', M + W / 2, y + 5, { align: 'center' });
    y += 9;
    y = titleBlock(doc, y, 'Identificación de la Liberación');
    textRow(doc, y, 'Número de control', ficha.general.numeroControl, 42); y += ROW;
    drawRow(doc, y, [
      { w: 42, text: 'Fecha de Solicitud', bold: true }, { w: 51, text: ficha.general.fechaSolicitud },
      { w: 42, text: 'Fecha de Liberación', bold: true }, { w: 51, text: ficha.general.fechaLiberacion },
    ]);
    y += ROW;
    textRow(doc, y, 'Líder del proyecto', ficha.general.liderProyecto); y += ROW;
    textRow(doc, y, 'Nombre del sistema', ficha.general.nombreSistema); y += ROW;
    textRow(doc, y, 'Versión', ficha.general.version); y += ROW;
    checkboxOptionRow(doc, y, 'Ambiente', ['Pruebas', 'Producción'], ficha.general.ambientes); y += ROW;
    optionRow(doc, y, 'Tipo de Liberación', ['Nueva versión', 'Corrección', 'Mejora'], ficha.general.tipoLiberacion); y += ROW;
    optionRow(doc, y, 'Prioridad', ['Alta', 'Media', 'Baja'], ficha.general.prioridad); y += ROW + 4;

    const deliveryNote = 'El Área de Desarrollo hace entrega de los componentes descritos en el presente documento para su implementación en el ambiente correspondiente. La validación, configuración, respaldo, publicación y operación en servidores institucionales será responsabilidad de la Subdirección de Operaciones, Seguridad y Proyectos Tecnológicos conforme a sus procedimientos.';
    doc.setFont('arial', 'normal');
    doc.setFontSize(8.5);
    const noteLines = doc.splitTextToSize(deliveryNote, W);
    doc.text(noteLines, M, y + 3.5, { align: 'justify', maxWidth: W });
    y += noteLines.length * 3.5 + 4;

    burgundyRow(y, [
      { w: 29, text: 'Entregable' },
      { w: 62, text: 'Incluye' },
      { w: 58, text: 'Ruta/Archivo' },
      { w: 18.5, text: 'Aplica' },
      { w: 18.5, text: 'No aplica' },
    ], 9);
    y += 9;
    ficha.entregables.forEach((item) => {
      const rowHeight = item.nombre === 'Variables de entorno' ? 15 : 11;
      drawRow(doc, y, [
        { w: 29, text: item.nombre, size: 9 },
        { w: 62, text: item.incluye, size: 9 },
        { w: 58, text: item.ruta, size: 9 },
        { w: 18.5, text: '' },
        { w: 18.5, text: '' },
      ], rowHeight);
      checkbox(doc, M + 29 + 62 + 58 + 7.5, y + (rowHeight - 3.5) / 2, selected(item.estado, 'aplica'));
      checkbox(doc, M + 29 + 62 + 58 + 18.5 + 7.5, y + (rowHeight - 3.5) / 2, selected(item.estado, 'no_aplica'));
      y += rowHeight;
    });
  };

  const drawPageTwo = () => {
    doc.addPage();
    header(doc);
    let y = 40;
    const validationNote = 'El Área de Desarrollo hace entrega de los componentes necesarios para la liberación del sistema a la Subdirección de Operaciones, Seguridad y Proyectos Tecnológicos, quien será responsable de la configuración, publicación y validación operativa en los servidores institucionales.';
    doc.setFont('arial', 'normal');
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(validationNote, W);
    doc.text(noteLines, M, y + 3.5, { align: 'justify', maxWidth: W });
    y += noteLines.length * 3.8 + 5;

    y = titleBlock(doc, y, 'Validación');
    const validationColumns = [
      { w: 59, text: 'Validación' },
      { w: 39, text: 'Responsable' },
      { w: 29.33, text: 'Correcto' },
      { w: 29.33, text: 'Error' },
      { w: 29.34, text: 'No aplica' },
    ];
    burgundyRow(y, validationColumns, 9);
    y += 9;
    [
      ['Pruebas funcionales', ficha.validacion.pruebasResponsable, ficha.validacion.pruebasResultado],
      ['Validación funcional del usuario solicitante', ficha.validacion.usuarioResponsable, ficha.validacion.usuarioResultado],
    ].forEach(([label, responsible, result]) => {
      const rowHeight = 18;
      drawRow(doc, y, [
        { w: 59, text: label, size: 9 },
        { w: 39, text: responsible, size: 9 },
        { w: 29.33, text: '' },
        { w: 29.33, text: '' },
        { w: 29.34, text: '' },
      ], rowHeight);
      const checkboxY = y + (rowHeight - 3.5) / 2;
      checkbox(doc, M + 59 + 39 + (29.33 - 3.5) / 2, checkboxY, selected(result, 'Correcto'));
      checkbox(doc, M + 59 + 39 + 29.33 + (29.33 - 3.5) / 2, checkboxY, selected(result, 'Error'));
      checkbox(doc, M + 59 + 39 + 29.33 * 2 + (29.34 - 3.5) / 2, checkboxY, selected(result, 'No aplica'));
      y += rowHeight;
    });

    y = titleBlock(doc, y, 'Observaciones');
    drawRow(doc, y, [{ w: W, text: pad(ficha.validacion.observaciones) }], 35);
    y += 42;
    doc.setFont('arial', 'normal');
    doc.setFontSize(9);
    const signatureNote = 'La firma del presente documento valida la entrega de componentes por parte del Área de Desarrollo y la Subdirección de Operaciones, Seguridad y Proyectos Tecnológicos.';
    const signatureLines = doc.splitTextToSize(signatureNote, W);
    doc.text(signatureLines, M, y + 3.5, { align: 'justify', maxWidth: W });
    y += signatureLines.length * 3.8 + 8;

    const leftCenter = M + 47;
    const rightCenter = M + 139;
    const leftName = ficha.responsables.firmaInfraestructura || '';
    const rightName = ficha.responsables.firmaDesarrollo || '';
    const signatureWidth = 76;
    doc.setFontSize(10);
    doc.text('Nombre y Firma', leftCenter, y, { align: 'center' });
    doc.text('Nombre y Firma', rightCenter, y, { align: 'center' });
    doc.setFont('arial', 'normal');
    [[leftName, leftCenter], [rightName, rightCenter]].forEach(([name, center]) => {
      doc.setFontSize(10);
      const textWidth = doc.getTextWidth(name);
      if (textWidth > signatureWidth) {
        doc.setFontSize(10 * signatureWidth / textWidth);
      } else {
        doc.setFontSize(10);
      }
      doc.text(name, center, y + 15, { align: 'center' });
    });
    doc.line(M + 8, y + 16, M + 86, y + 16);
    doc.line(M + 100, y + 16, M + W - 8, y + 16);
    doc.setFont('arial', 'bold');
    doc.setFontSize(8.5);
    doc.text('Responsable de Recepción y Publicación', leftCenter, y + 22, { align: 'center', maxWidth: 78 });
    doc.text('Responsable de Entrega Técnica', rightCenter, y + 22, { align: 'center', maxWidth: 78 });
    doc.setFont('arial', 'normal');
    doc.setFontSize(8);
    doc.text(ficha.responsables.cargoInfraestructura, leftCenter, y + 27, { align: 'center', maxWidth: 78 });
    doc.text(ficha.responsables.cargoDesarrollo, rightCenter, y + 27, { align: 'center', maxWidth: 78 });
  };

  drawPageOne();
  footer(doc);
  drawPageTwo();
  footer(doc);

  doc.save(fileName);
  return doc;
};

export default { buildLiberacionFichaData, generateLiberacionFichaPdf };
