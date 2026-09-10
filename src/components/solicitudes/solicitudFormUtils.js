const INT_FIELDS = ['servicio_id', 'adscripcion_id', 'empleado_id', 'equipo_id', 'cantidad_ser', 'evaluacion_ser'];
const BOOL_FIELDS = ['indicador_equipo', 'estatus', 'licenciamiento_ser', 'winoriginal_ser', 'ofioriginal_ser'];

export const EVALUACION_OPTIONS = [
  { value: '1', label: 'MALO', emoji: '😞', desc: 'Servicio deficiente', color: '#dc2626', bg: 'bg-red-50', border: 'border-red-400' },
  { value: '2', label: 'REGULAR', emoji: '😐', desc: 'Cumplió lo básico', color: '#d97706', bg: 'bg-amber-50', border: 'border-amber-400' },
  { value: '3', label: 'BUENO', emoji: '😊', desc: 'Buen servicio', color: '#16a34a', bg: 'bg-green-50', border: 'border-green-500' },
  { value: '4', label: 'EXCELENTE', emoji: '🤩', desc: 'Superó expectativas', color: '#0f766e', bg: 'bg-teal-50', border: 'border-teal-600' },
];

export const evaluacionLabel = (value) => {
  const normalized = String(value) === '5' ? '4' : String(value);
  const opt = EVALUACION_OPTIONS.find((o) => o.value === normalized);
  return opt ? `${opt.emoji} ${opt.label}` : '—';
};

export const STEP_FIELDS = {
  solicitud: ['servicio_id', 'adscripcion_id', 'empleado_id', 'equipo_id', 'descripcion', 'fecha', 'hora', 'indicador_equipo'],
  diagnostico: ['fecha_diag', 'hora_diag', 'descripcion_diag', 'fecha_diag_entrega', 'hora_diag_entrega'],
  servicio: ['fecha_ser', 'hora_ser', 'descripcion_ser', 'observaciones_ser', 'licenciamiento_ser', 'winoriginal_ser', 'ofioriginal_ser', 'cantidad_ser'],
  refacciones: ['utilizados_ser'],
  evaluacion: ['evaluacion_ser'],
  cerrar: ['estatus'],
};

export const buildSolicitudPayload = (form, fields, extra = {}) => {
  const payload = { ...extra };

  fields.forEach((key) => {
    const val = form[key];
    if (val === '' || val === null || val === undefined) return;

    if (INT_FIELDS.includes(key)) {
      payload[key] = Number(val);
    } else if (BOOL_FIELDS.includes(key)) {
      payload[key] = val === '1' || val === 1 ? 1 : 0;
    } else {
      payload[key] = val;
    }
  });

  if (form.indicador_equipo !== '1' && form.indicador_equipo !== 1) {
    payload.equipo_id = null;
  }

  return payload;
};

export const inputClass =
  'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-colorPrimario/40';

export const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-gray-500';
