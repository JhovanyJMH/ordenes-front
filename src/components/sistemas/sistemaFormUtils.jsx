import { FiCheckCircle, FiSearch } from 'react-icons/fi';

export const emptySistema = {
  nombre: '',
  siglas: '',
  anio_desarrollo: '',
  estado_operativo: '',
  sistema_principal_id: '',
  nivel_impacto: '',
  version: '',
  url: '',
  ambiente_despliegue: '',
  tipo_infraestructura: '',
  tipo_sistema: '',
  adscripcion_id: '',
  adscripcion_nombre: '',
  enlace_empleado_id: '',
  enlace_empleado_nombre: '',
  lider_administrador_id: '',
  lider_administrador_nombre: '',
  objetivo: '',
  descripcion_funcional: '',
  principales_modulos: '',
  lenguaje_desarrollo: '',
  fecha_conclusion_desarrollo: '',
  fecha_liberacion_produccion: '',
  ultima_actualizacion: '',
  plataforma_desarrollo: '',
  arquitectura: '',
  cuenta_codigo_fuente: '',
  repositorio_codigo: '',
  cuenta_documentacion_tecnica: '',
  actualizacion_documentacion: '',
  observaciones: '',
  es_interoperable: '',
  activo: true,
  alcance: '',
  framework: '',
  gestor_base_datos: '',
};

export const ESTADO_OPERATIVO_OPTIONS = [
  ['En operación', 'Sistema en uso cotidiano'],
  ['En desarrollo', 'Aún no se libera'],
  ['En mantenimiento', 'Ajustes o soporte activo'],
  ['Suspendido', 'Fuera de operación temporal'],
  ['Descontinuado', 'Ya no se utiliza'],
];

export const NIVEL_IMPACTO_OPTIONS = [
  ['Crítico', 'Afecta procesos sustantivos', '#b91c1c'],
  ['Alto', 'Impacto operativo relevante', '#c2410c'],
  ['Medio', 'Uso regular del área', '#b45309'],
  ['Bajo', 'Uso acotado o de apoyo', '#0369a1'],
];

export const TIPO_SISTEMA_OPTIONS = [
  ['Web', 'Aplicación o portal web'],
  ['Escritorio', 'Instalado en estación de trabajo'],
  ['Móvil', 'App para dispositivos móviles'],
  ['Servicio / API', 'Integración o backend'],
  ['Híbrido', 'Más de un tipo de interfaz'],
];

export const AMBIENTE_OPTIONS = [
  ['Producción', 'Ambiente operativo'],
  ['Pruebas', 'Validación previa'],
  ['Desarrollo', 'Construcción interna'],
  ['Staging', 'Preproducción'],
];

export const INFRAESTRUCTURA_OPTIONS = [
  ['On-premise', 'Servidores institucionales'],
  ['Nube', 'Infraestructura en la nube'],
  ['Híbrida', 'Combinación de ambas'],
];

export const SI_NO_OPTIONS = [
  ['Sí', 'Cuenta con el recurso'],
  ['No', 'No disponible'],
];

export const withCurrentOption = (options, value, description = 'Valor actual del registro') => {
  if (!value) return options;
  if (options.some(([option]) => option === value)) return options;
  return [[value, description], ...options];
};

export const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm transition-all focus:border-[#8A2036] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/20';

export const labelClass = 'mb-2 block text-sm font-semibold tracking-tight text-gray-800';

export const FieldLabel = ({ children, required, htmlFor }) => (
  <label htmlFor={htmlFor} className={labelClass}>
    {children}
    {required ? <span className="ml-1 text-[#8A2036]">*</span> : null}
  </label>
);

export const SearchPicker = ({ label, required, value, filled, placeholder, onOpen, hint }) => {
  const isFilled = filled ?? Boolean(value);
  return (
    <div>
      {label ? <FieldLabel required={required}>{label}</FieldLabel> : null}
      <div className="relative">
        <input
          type="text"
          value={value}
          readOnly
          placeholder={placeholder}
          onClick={onOpen}
          className={`${inputClass} cursor-pointer pr-12 ${isFilled ? 'border-emerald-200 bg-emerald-50/70' : 'bg-gray-50'}`}
        />
        <button
          type="button"
          onClick={onOpen}
          aria-label={label ? `Buscar ${label}` : 'Buscar'}
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-all ${
            isFilled ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <FiSearch size={18} />
        </button>
      </div>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-gray-500">{hint}</p> : null}
    </div>
  );
};

export const ChoiceButton = ({ selected, onClick, title, description, accent = '#8A2036' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`relative w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
      selected ? 'bg-white shadow-md ring-2 ring-offset-1' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
    }`}
    style={selected ? { borderColor: accent, ringColor: `${accent}4D` } : undefined}
  >
    {selected ? (
      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ backgroundColor: accent }}>
        <FiCheckCircle size={12} />
      </span>
    ) : null}
    <span className="block font-bold text-gray-800">{title}</span>
    {description ? <span className="mt-1 block text-xs text-gray-500">{description}</span> : null}
  </button>
);

export const SectionCard = ({ icon: Icon, title, children, className = '' }) => (
  <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}>
    {title ? (
      <div className="mb-4 flex items-center gap-2 text-[#8A2036]">
        {Icon ? <Icon size={18} /> : null}
        <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
      </div>
    ) : null}
    {children}
  </div>
);

export const SummaryItem = ({ label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-gray-800">{value || '-'}</p>
  </div>
);

const dateValue = (value) => (value ? String(value).slice(0, 10) : '');

export const empleadoDisplayName = (empleado) => {
  if (!empleado) return '';
  return `${empleado.nombre || ''} ${empleado.apellidos || ''}`.trim();
};

export const userDisplayName = (user) => {
  if (!user) return '';
  if (user.nombre_completo?.trim()) return user.nombre_completo.trim();
  return [user.name, user.ap_paterno, user.ap_materno].filter(Boolean).join(' ').trim();
};

export const mapSistemaToForm = (data = {}) => ({
  ...emptySistema,
  ...data,
  anio_desarrollo: data.anio_desarrollo ?? '',
  es_interoperable: data.es_interoperable == null ? '' : String(Boolean(data.es_interoperable)),
  fecha_conclusion_desarrollo: dateValue(data.fecha_conclusion_desarrollo),
  fecha_liberacion_produccion: dateValue(data.fecha_liberacion_produccion),
  ultima_actualizacion: dateValue(data.ultima_actualizacion),
  adscripcion_nombre: data.adscripcion?.descripcion || '',
  enlace_empleado_nombre: empleadoDisplayName(data.enlace_empleado),
  lider_administrador_nombre: userDisplayName(data.lider_administrador),
  activo: data.activo !== false,
});

export const buildSistemaPayload = (form, sistemaPrincipalId) => {
  const rest = { ...form };
  delete rest.adscripcion_nombre;
  delete rest.enlace_empleado_nombre;
  delete rest.lider_administrador_nombre;
  delete rest.sistema_principal;

  return {
    ...rest,
    sistema_principal_id: sistemaPrincipalId || form.sistema_principal_id,
    anio_desarrollo: form.anio_desarrollo || null,
    es_interoperable: form.es_interoperable === '' ? null : form.es_interoperable === 'true',
  };
};
