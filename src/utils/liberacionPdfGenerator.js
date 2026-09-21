import jsPDF from 'jspdf';
import LogoEdoMex from '../images/Recurso 6.png';
import LogoDGDITI from '../images/recurso5.png';
import LogoFooter from '../images/recurso4.png';

const pad = (value) => (value === null || value === undefined ? '' : String(value).trim());
const isChecked = (value) => value === true || value === 1 || value === '1' || value === 'true';
const fmtDate = (value) => {
  if (!value) return '';
  const str = String(value).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return str;
};

export const buildLiberacionFichaData = (data = {}) => {
  if (data && typeof data === 'object' && data.general && data.red) {
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

  const ambiente =
    firstValue(source.ambiente, source.ambienteSeleccionado) ||
    (source.ambiente_desarrollo ? 'Desarrollo' : '') ||
    (source.ambiente_pruebas ? 'Pruebas' : '') ||
    (source.ambiente_produccion ? 'Producción' : '');

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

  const impacto =
    firstValue(source.impacto) ||
    (source.impacto_critico ? 'Crítico' : '') ||
    (source.impacto_moderado ? 'Moderado' : '') ||
    (source.impacto_bajo ? 'Bajo' : '');

  const resultadoLiberacion =
    firstValue(source.resultado_liberacion, source.resultadoLiberacion) ||
    (source.liberacion_exitosa ? 'Liberación Exitosa' : '') ||
    (source.liberacion_parcial ? 'Liberación Parcial' : '') ||
    (source.liberacion_rechazada ? 'Liberación Rechazada' : '');

  return {
    general: {
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
      ambiente,
      tipoLiberacion,
      prioridad,
      impacto,
    },
    red: {
      url: pad(firstValue(source.url, source.f_ruta, source.frontendRuta)),
      puerto: pad(firstValue(source.puerto_utilizado, source.puertoUtilizado)),
      ipFront: pad(firstValue(source.ip_frontend, source.ipFrontend, source.f_ruta_entregado, source.frontendRutaEntregado, source.f_ruta)),
      ipBack: pad(firstValue(source.ip_backend, source.ipBackend, source.b_ruta_entregado, source.backendRutaEntregado, source.b_ruta)),
      ipBd: pad(firstValue(source.ip_bd, source.ipBd, source.bd_ruta_entregado, source.baseDatosRutaEntregado, source.bd_ruta)),
    },
    rutas: {
      frontend: pad(firstValue(source.f_ruta, source.frontendRuta, source.red?.url)),
      frontendEntregado: pad(firstValue(source.f_ruta_entregado, source.frontendRutaEntregado)),
      backend: pad(firstValue(source.b_ruta, source.backendRuta, source.ip_backend, source.ipBackend)),
      backendEntregado: pad(firstValue(source.b_ruta_entregado, source.backendRutaEntregado, source.ip_backend, source.ipBackend)),
      bd: pad(firstValue(source.bd_ruta, source.baseDatosRuta, source.ip_bd, source.ipBd)),
      bdEntregado: pad(firstValue(source.bd_ruta_entregado, source.baseDatosRutaEntregado, source.ip_bd, source.ipBd)),
      vars: pad(firstValue(source.var_entorno, source.varEntorno, source.observaciones)),
      varsEntregado: pad(firstValue(source.var_entorno_entregado, source.varEntornoEntregado, source.observaciones_finales)),
    },
    entregables: {
      frontend: Boolean(source.entregable_frontend ?? !!(source.f_ruta || source.f_ruta_entregado)),
      backend: Boolean(source.entregable_backend ?? !!(source.b_ruta || source.b_ruta_entregado)),
      bd: Boolean(source.entregable_bd ?? !!(source.bd_ruta || source.bd_ruta_entregado)),
      variables: Boolean(source.entregable_variables ?? !!(source.var_entorno_entregado)),
    },
    configuracion: {
      servidor: Boolean(source.configuracion_servidor),
      bd: Boolean(source.configuracion_bd),
      desarrollo: Boolean(source.configuracion_desarrollo),
      asignacionIp: Boolean(source.asignacion_ip),
      publicacionSistema: Boolean(source.publicacion_sistema),
      validacionOperativa: Boolean(source.validacion_operativa),
      respaldoPrevio: Boolean(source.respaldo_previo),
    },
    validacion: {
      tiempo: pad(source.tiempo_validacion || source.tiempoValidacion || ''),
      resultado: resultadoLiberacion,
      observaciones: pad(source.observaciones_finales || source.observaciones || ''),
      frontendResponsable: pad(source.validacion_frontend_responsable || ''),
      frontendResultado: pad(source.validacion_frontend_resultado || ''),
      backendResponsable: pad(source.validacion_backend_responsable || ''),
      backendResultado: pad(source.validacion_backend_resultado || ''),
      migracionesResponsable: pad(source.validacion_migraciones_responsable || ''),
      migracionesResultado: pad(source.validacion_migraciones_resultado || ''),
      pruebasResponsable: pad(source.validacion_pruebas_responsable || ''),
      pruebasResultado: pad(source.validacion_pruebas_resultado || ''),
      accesoResponsable: pad(source.validacion_acceso_responsable || ''),
      accesoResultado: pad(source.validacion_acceso_resultado || ''),
      publicacionResponsable: pad(source.validacion_publicacion_responsable || ''),
      publicacionResultado: pad(source.validacion_publicacion_resultado || ''),
    },
    responsables: {
      infraestructura: empleadoNombre(source.responsable_infraestructura || source.responsableInfraestructura),
      desarrollo: empleadoNombre(source.responsable_desarrollo || source.responsableDesarrollo),
      firmaInfraestructura: empleadoNombre(source.responsable_infraestructura || source.responsableInfraestructura),
      firmaDesarrollo: empleadoNombre(source.responsable_desarrollo || source.responsableDesarrollo),
    },
    resultadoLiberacion,
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

const checkColumnRow = (doc, y, label, checked, labelWidth = 136) => {
  drawRow(doc, y, [{ w: labelWidth, text: label }, { w: 25, text: '' }, { w: W - labelWidth - 25, text: '' }]);
  checkbox(doc, M + labelWidth + 10.5, y + 2.2, checked);
  checkbox(doc, M + labelWidth + 25 + 10.5, y + 2.2, !checked);
};

export const generateLiberacionFichaPdf = (fichaData, fileName = 'ficha-liberacion.pdf') => {
  const ficha = buildLiberacionFichaData(fichaData);
  const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
  const selected = (value, expected) => String(value || '').toLowerCase() === expected.toLowerCase();
  const resultChecked = (value, type) => {
    const normalized = String(value || '').toLowerCase();
    return type === 'ok'
      ? normalized.includes('correcto') || normalized.includes('ok') || normalized === 'si'
      : normalized.includes('error') || normalized === 'no';
  };
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
    doc.text('Formato de Liberación', M + W / 2, y + 5, { align: 'center' });
    y += 10;
    y = titleBlock(doc, y, 'Identificación de la Liberación');
    drawRow(doc, y, [
      { w: 41, text: 'Fecha de Solicitud', bold: true }, { w: 52, text: ficha.general.fechaSolicitud },
      { w: 41, text: 'Fecha de Liberación', bold: true }, { w: 52, text: ficha.general.fechaLiberacion },
    ]);
    y += ROW;
    textRow(doc, y, 'Líder del proyecto', ficha.general.liderProyecto); y += ROW;
    textRow(doc, y, 'Nombre del sistema', ficha.general.nombreSistema); y += ROW;
    textRow(doc, y, 'Versión', ficha.general.version); y += ROW;
    optionRow(doc, y, 'Ambiente', ['Desarrollo', 'Pruebas', 'Producción'], ficha.general.ambiente); y += ROW;
    optionRow(doc, y, 'Tipo de Liberación', ['Nueva versión', 'Corrección', 'Mejora'], ficha.general.tipoLiberacion); y += ROW;
    optionRow(doc, y, 'Prioridad', ['Alta', 'Media', 'Baja'], ficha.general.prioridad); y += ROW;
    optionRow(doc, y, 'Impacto', ['Crítico', 'Moderado', 'Bajo'], ficha.general.impacto); y += ROW + 5;

    doc.setFont('arial', 'normal');
    doc.setFontSize(11);
    doc.text('Información Técnica', M, y + 4); y += 7;
    burgundyRow(y, [{ w: 42, text: '' }, { w: 144, text: 'Información' }]); y += ROW;
    textRow(doc, y, 'URL', ficha.red.url); y += ROW;
    textRow(doc, y, 'Puerto utilizado', ficha.red.puerto); y += ROW;
    textRow(doc, y, 'IP Backend', ficha.red.ipBack); y += ROW;
    textRow(doc, y, 'IP Frontend', ficha.red.ipFront); y += ROW;
    textRow(doc, y, 'IP DB', ficha.red.ipBd); y += ROW + 5;

    doc.setFont('arial', 'normal');
    doc.setFontSize(11);
    const infoText = 'El Área de Desarrollo hace entrega de los componentes necesarios para la liberación del sistema al Área de Infraestructura, quien será responsable de la configuración, publicación y validación operativa en los servidores institucionales.';
    doc.text(doc.splitTextToSize(infoText, W), M, y + 4, { align: 'justify', maxWidth: W });
    y += 16;

    burgundyRow(y, [{ w: 42, text: 'Entregable' }, { w: 84, text: 'Incluye' }, { w: 30, text: 'Completa' }, { w: 30, text: 'Parcial' }]); y += ROW;
    const deliverables = [
      ['Frontend', ficha.rutas.frontend || 'Archivos compilados / proyecto frontend', ficha.entregables.frontend],
      ['Backend', ficha.rutas.backend || 'API / servicios / lógica de negocio', ficha.entregables.backend],
      ['Base de Datos', ficha.rutas.bd || 'Scripts SQL / migraciones', ficha.entregables.bd],
      ['Variables de entorno', ficha.rutas.vars || 'Variables .env y configuraciones necesarias', ficha.entregables.variables],
    ];
    deliverables.forEach(([label, include, checked]) => {
      const complete = isChecked(checked);
      drawRow(doc, y, [{ w: 42, text: label }, { w: 84, text: include }, { w: 30, text: '' }, { w: 30, text: '' }]);
      checkbox(doc, M + 42 + 84 + 13, y + 2.2, complete);
      checkbox(doc, M + 42 + 84 + 30 + 13, y + 2.2, !complete);
      y += ROW;
    });
    y += 5;
    doc.setFontSize(11);
    doc.text('Configuración de Infraestructura', M, y + 4); y += 7;
    burgundyRow(y, [{ w: 136, text: 'Actividad' }, { w: 25, text: 'Sí' }, { w: 25, text: 'No' }]); y += ROW;
    checkColumnRow(doc, y, 'Configuración del servidor (Apache, PHP, permisos)', ficha.configuracion.servidor); y += ROW;
    checkColumnRow(doc, y, 'Configuración de Base de Datos', ficha.configuracion.bd);
  };

  const drawPageTwo = () => {
    doc.addPage();
    header(doc);
    let y = 40;
    checkColumnRow(doc, y, 'Asignación de IP', ficha.configuracion.asignacionIp); y += ROW;
    checkColumnRow(doc, y, 'Publicación del sistema', ficha.configuracion.publicacionSistema); y += ROW;
    checkColumnRow(doc, y, 'Validación operativa posterior a la liberación', ficha.configuracion.validacionOperativa); y += ROW;
    checkColumnRow(doc, y, 'Respaldo previo realizado y validado', ficha.configuracion.respaldoPrevio); y += ROW + 7;

    doc.setFont('arial', 'normal');
    doc.setFontSize(11);
    doc.text('Validaciones previas', M, y + 4); y += 7;
    burgundyRow(y, [{ w: 63, text: 'Validación' }, { w: 63, text: 'Responsable' }, { w: 30, text: 'Correcto' }, { w: 30, text: 'Error' }]); y += ROW;
    const validations = [
      ['Compilación Frontend', ficha.validacion.frontendResponsable, ficha.validacion.frontendResultado],
      ['Validación Backend', ficha.validacion.backendResponsable, ficha.validacion.backendResultado],
      ['Ejecución de migraciones', ficha.validacion.migracionesResponsable, ficha.validacion.migracionesResultado],
      ['Pruebas funcionales', ficha.validacion.pruebasResponsable, ficha.validacion.pruebasResultado],
      ['Validación de acceso', ficha.validacion.accesoResponsable, ficha.validacion.accesoResultado],
      ['Validación de publicación en el entorno de ambiente', ficha.validacion.publicacionResponsable, ficha.validacion.publicacionResultado],
    ];
    validations.forEach(([label, responsible, result], index) => {
      const h = index === validations.length - 1 ? 12 : ROW;
      drawRow(doc, y, [{ w: 63, text: label }, { w: 63, text: responsible }, { w: 30, text: '' }, { w: 30, text: '' }], h);
      checkbox(doc, M + 63 + 63 + 13, y + (h - 3.5) / 2, resultChecked(result, 'ok'));
      checkbox(doc, M + 63 + 63 + 30 + 13, y + (h - 3.5) / 2, resultChecked(result, 'error'));
      y += h;
    });
    y += 7;
    y = titleBlock(doc, y, 'Resultados de la liberación');
    drawRow(doc, y, [{ w: 62, text: 'Liberación Exitosa' }, { w: 62, text: 'Liberación Parcial' }, { w: 62, text: 'Liberación Rechazada' }], 10);
    checkbox(doc, M + 57, y + 3.2, selected(ficha.resultadoLiberacion, 'Liberación Exitosa'));
    checkbox(doc, M + 119, y + 3.2, selected(ficha.resultadoLiberacion, 'Liberación Parcial'));
    checkbox(doc, M + 181, y + 3.2, selected(ficha.resultadoLiberacion, 'Liberación Rechazada'));
    y += 17;
    y = titleBlock(doc, y, 'Observaciones');
    drawRow(doc, y, [{ w: W, text: pad(ficha.validacion.observaciones) || 'Sin observaciones' }], 30);
    y += 38;
    doc.setFont('arial', 'normal');
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize('La firma del presente documento valida la entrega de componentes por parte del Área de Desarrollo y la publicación/configuración realizada por el Área de Infraestructura.', W), M, y, { align: 'justify', maxWidth: W });
    y += 12;
    doc.setFontSize(11);
    doc.text('Nombre y Firma', 55, y, { align: 'center' });
    doc.text('Nombre y Firma', 155, y, { align: 'center' });
    doc.text(ficha.responsables.firmaInfraestructura || ' ', 55, y + 7, { align: 'center' });
    doc.text(ficha.responsables.firmaDesarrollo || ' ', 155, y + 7, { align: 'center' });
    doc.line(M + 10, y + 11, M + 80, y + 11);
    doc.line(M + 110, y + 11, M + W, y + 11);
    doc.text('Responsable de Infraestructura', 55, y + 19, { align: 'center' });
    doc.text('Responsable de Desarrollo', 155, y + 19, { align: 'center' });
    doc.setFontSize(9);
    doc.text('Subdirector de Operaciones, Seguridad y Proyectos Tecnológicos', 55, y + 25, { align: 'center', maxWidth: 70 });
    doc.text('Subdirectora de Desarrollo de Software y Bases de Datos', 155, y + 25, { align: 'center', maxWidth: 70 });
  };

  drawPageOne();
  footer(doc);
  drawPageTwo();
  footer(doc);

  doc.save(fileName);
  return doc;
};

export default { buildLiberacionFichaData, generateLiberacionFichaPdf };
