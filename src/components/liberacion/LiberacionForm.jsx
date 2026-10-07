import { useEffect, useMemo, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { FiDownload, FiLayers, FiShield, FiCheckCircle, FiClipboard, FiActivity, FiSearch, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import liberacionService from '../../services/liberacionService';
import empleadosService from '../../services/empleadosService';
import usersService from '../../services/usersService';
import sistemasService from '../../services/sistemasService';
import { generateLiberacionFichaPdf, buildLiberacionFichaData } from '../../utils/liberacionPdfGenerator';
import SearchModal from '../common/SearchModal';

const initialForm = {
  numero_control: '',
  fecha_solicitud: new Date().toISOString().slice(0, 10),
  fecha_liberacion: new Date().toISOString().slice(0, 10),
  lider_proyecto_id: '',
  lider_proyecto: '',
  sistema_id: '',
  nombre_sistema: '',
  version: '',
  ambiente_pruebas: false,
  ambiente_produccion: false,
  tipo_liberacion: '',
  prioridad: '',
  entregable_frontend_estado: '',
  entregable_backend_estado: '',
  entregable_bd_estado: '',
  entregable_variables_estado: '',
  observaciones_finales: '',
  validacion_pruebas_resultado: '',
  validacion_acceso_resultado: '',
  responsable_infraestructura_id: '',
  responsable_infraestructura: '',
  cargo_infraestructura: 'Subdirector de Operaciones, Seguridad y Proyectos Tecnológicos',
  responsable_desarrollo_id: '',
  responsable_desarrollo: '',
  cargo_desarrollo: 'Subdirectora de Desarrollo de Software y Bases de Datos',
  f_ruta: '',
  b_ruta: '',
  bd_ruta: '',
  var_entorno: '',
  estatus: 1,
};

const STEPS = [
  { id: 'generales', label: 'Identificación', description: 'Datos básicos del sistema, fechas y responsable del proyecto.', icon: FiClipboard, color: '#8A2036', bg: 'from-[#8A2036]/10 to-[#BC955B]/5' },
  { id: 'entregables', label: 'Entregables', description: 'Define qué componentes y rutas forman parte de la liberación.', icon: FiLayers, color: '#1f7a8c', bg: 'from-[#1f7a8c]/10 to-teal-50' },
  { id: 'validaciones', label: 'Validaciones', description: 'Registra el resultado de las pruebas y la validación funcional.', icon: FiCheckCircle, color: '#0f766e', bg: 'from-emerald-100/80 to-teal-50' },
  { id: 'firmas', label: 'Firmas', description: 'Selecciona a los responsables de recepción y entrega técnica.', icon: FiActivity, color: '#BC955B', bg: 'from-[#DAC19A]/30 to-[#BC955B]/10' },
  { id: 'generar', label: 'Generar', description: 'Revisa el resumen final y descarga la ficha en PDF.', icon: FiDownload, color: '#8A2036', bg: 'from-[#8A2036]/10 to-[#BC955B]/5' },
];

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white/95 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#8A2036] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/20 transition-all shadow-sm';
const labelClass = 'block text-sm font-semibold text-gray-800 mb-2 tracking-tight';

const userDisplayName = (user) => {
  if (!user) return '';
  if (typeof user === 'string') return user.trim();
  if (user.nombre_completo?.trim()) return user.nombre_completo.trim();
  return [user.name, user.ap_paterno, user.ap_materno].filter(Boolean).join(' ').trim();
};

const fieldConfig = [
  { key: 'lider_proyecto', label: 'Líder del proyecto', icon: FiShield, type: 'text', placeholder: 'Nombre del responsable' },
];

const LiberacionForm = ({ mode = 'create', editId = null }) => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState(null);
  const containerRef = useRef(null);

  // Estado para modales de búsqueda de empleados
  const [modals, setModals] = useState({
    lider_proyecto: false,
    sistema: false,
    responsable_infraestructura: false,
    responsable_desarrollo: false,
  });

  useEffect(() => {
    if (mode === 'edit' && editId) {
      loadLiberacion(editId);
    }
  }, [mode, editId]);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2800);
  };

  const loadLiberacion = async (id) => {
    try {
      setLoading(true);
      const response = await liberacionService.getLiberacionById(id);
      const data = response?.data || response;
      
      const employeeName = (emp) => {
        if (!emp) return '';
        if (typeof emp === 'string') return emp;
        return `${emp.nombre || ''} ${emp.apellidos || ''}`.trim();
      };

      const formatDate = (dateValue) => {
        if (!dateValue) return '';
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return '';
          return date.toISOString().slice(0, 10);
        } catch {
          return '';
        }
      };

      const liderProyectoValue = userDisplayName(data.lider_proyecto_data || data.lider_proyecto);
      setFormData({
        ...initialForm,
        ...data,
        fecha_solicitud: formatDate(data.fecha_solicitud) || initialForm.fecha_solicitud,
        fecha_liberacion: formatDate(data.fecha_liberacion) || initialForm.fecha_liberacion,
        lider_proyecto_id: data.lider_proyecto_id || '',
        lider_proyecto: liderProyectoValue,
        sistema_id: data.sistema_id || data.sistema?.id || '',
        ambiente_pruebas: Boolean(data.ambiente_pruebas),
        ambiente_produccion: Boolean(data.ambiente_produccion),
        responsable_infraestructura: employeeName(data.responsable_infraestructura_data || data.responsable_infraestructura),
        responsable_desarrollo: employeeName(data.responsable_desarrollo_data || data.responsable_desarrollo),
        cargo_infraestructura: data.cargo_infraestructura || data.responsable_infraestructura?.puesto || initialForm.cargo_infraestructura,
        cargo_desarrollo: data.cargo_desarrollo || data.responsable_desarrollo?.puesto || initialForm.cargo_desarrollo,
        estatus: Number(data.estatus ?? 1),
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la ficha de liberación.',
      });
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = useMemo(() => {
    return Boolean(
      formData.fecha_solicitud
      && formData.fecha_liberacion
      && formData.lider_proyecto
      && formData.sistema_id
      && formData.nombre_sistema
      && formData.version
      && formData.tipo_liberacion
      && formData.prioridad
      && (formData.ambiente_pruebas || formData.ambiente_produccion),
    );
  }, [formData]);

  const goToStep = (idx) => setCurrentStep(idx);
  const step = STEPS[currentStep];
  const focusRing = { '--tw-ring-color': step.color };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => {
      let nextValue = value;

      if (type === 'checkbox') {
        nextValue = checked;
      }

      return {
        ...prev,
        [name]: nextValue,
      };
    });
  };

  const handleSistemaSelect = (option) => {
    setFormData((prev) => ({
      ...prev,
      sistema_id: option?.value || '',
      nombre_sistema: option?.nombre || option?.label || '',
      version: option?.version || '',
    }));
  };

  const openModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  };

  const handleSearchSelectChange = (fieldId, fieldName, cargoField) => (option) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: option?.value || '',
      [fieldName]: option?.label || '',
      ...(cargoField ? { [cargoField]: option?.puesto || '' } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (!canGenerate) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Completa al menos líder del proyecto, sistema, versión y ambiente.',
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        estatus: Number(formData.estatus ?? 1),
      };

      let response;
      if (mode === 'edit' && editId) {
        response = await liberacionService.updateLiberacion(editId, payload);
      } else {
        response = await liberacionService.createLiberacion(payload);
      }

      const data = response?.data && response.data.data ? response.data.data : response?.data || response || payload;
      const ficha = buildLiberacionFichaData(data);
      const fileName = `${(formData.nombre_sistema || 'sistema').replace(/\s+/g, '-').toLowerCase()}-ficha-liberacion.pdf`;
      generateLiberacionFichaPdf(ficha, fileName);

      showToast(mode === 'edit' ? 'Ficha actualizada y descargada' : 'Ficha generada y descargada');

      if (mode === 'create') {
        setFormData(initialForm);
        setCurrentStep(0);
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'No se pudo guardar la ficha de liberación.',
      });
    }
  };

  const renderStepContent = () => {
    switch (step.id) {
      case 'generales':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border-l-4 border-[#8A2036] bg-white/80 p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#8A2036] to-[#a9354c] text-white shadow-lg">
                <FiClipboard size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 tracking-tight">Datos generales</p>
                <p className="mt-1 text-sm text-gray-600">Información básica de la liberación.</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200/60 bg-white/95 p-6 shadow-lg backdrop-blur-sm">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Fecha solicitud</label>
                  <input type="date" name="fecha_solicitud" value={formData.fecha_solicitud} onChange={handleChange} className={inputClass} style={focusRing} />
                </div>
                <div>
                  <label className={labelClass}>Fecha liberación</label>
                  <input type="date" name="fecha_liberacion" value={formData.fecha_liberacion} onChange={handleChange} className={inputClass} style={focusRing} />
                </div>
                {fieldConfig.map(({ key, label, type, placeholder }) => (
                  <div key={key} className={key === 'version' ? 'md:col-span-2' : ''}>
                    {key === 'lider_proyecto' ? (
                      <>
                        <label className={labelClass}>{label}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.lider_proyecto}
                            readOnly
                            placeholder="Buscar empleado..."
                            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:border-[#8A2036] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/20 transition-all shadow-sm cursor-pointer"
                            onClick={() => openModal('lider_proyecto')}
                            style={focusRing}
                          />
                          <button
                            type="button"
                            onClick={() => openModal('lider_proyecto')}
                            className="rounded-lg bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-4 py-3 text-white transition-all hover:brightness-110 shadow-md"
                          >
                            <FiSearch size={18} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className={labelClass}>{label}</label>
                        <input
                          type={type}
                          name={key}
                          value={formData[key]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          readOnly={key === 'version' && Boolean(formData.sistema_id)}
                          className={inputClass}
                          style={focusRing}
                        />
                      </>
                    )}
                  </div>
                ))}
                {formData.numero_control && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>Número de control</label>
                    <input type="text" value={formData.numero_control} readOnly className={`${inputClass} bg-gray-50`} />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className={labelClass}>Sistema del catálogo</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.nombre_sistema} readOnly placeholder="Buscar sistema..." className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 shadow-sm" onClick={() => openModal('sistema')} />
                    <button type="button" onClick={() => openModal('sistema')} className="rounded-lg bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-4 py-3 text-white shadow-md"><FiSearch size={18} /></button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">La selección del catálogo asigna las siglas para generar el número de control.</p>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Nombre del sistema</label>
                  <input type="text" name="nombre_sistema" value={formData.nombre_sistema} onChange={handleChange} placeholder="Nombre del sistema" className={inputClass} style={focusRing} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Versión</label>
                  <input type="text" name="version" value={formData.version} onChange={handleChange} placeholder="Ej. 1.0.0" readOnly={Boolean(formData.sistema_id)} className={inputClass} style={focusRing} />
                </div>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <fieldset className="rounded-xl border border-gray-200/60 bg-white/95 p-5 shadow-sm">
                <legend className="px-1 text-sm font-bold text-gray-800">Ambiente</legend>
                {[
                  ['ambiente_pruebas', 'Pruebas'],
                  ['ambiente_produccion', 'Producción'],
                ].map(([name, label]) => (
                  <label key={name} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <input type="checkbox" name={name} checked={formData[name]} onChange={handleChange} className="h-4 w-4 accent-[#8A2036]" />
                    {label}
                  </label>
                ))}
              </fieldset>
              {[
                ['tipo_liberacion', 'Tipo de Liberación', ['Nueva versión', 'Corrección', 'Mejora']],
                ['prioridad', 'Prioridad', ['Alta', 'Media', 'Baja']],
              ].map(([name, title, options]) => (
                <fieldset key={name} className="rounded-xl border border-gray-200/60 bg-white/95 p-5 shadow-sm">
                  <legend className="px-1 text-sm font-bold text-gray-800">{title}</legend>
                  {options.map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <input type="radio" name={name} value={option} checked={formData[name] === option} onChange={handleChange} className="h-4 w-4 accent-[#8A2036]" />
                      {option}
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>
          </div>
        );

      case 'entregables':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border-l-4 border-[#6b46c1] bg-white/80 p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#6b46c1] to-violet-600 text-white shadow-lg">
                <FiLayers size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 tracking-tight">Entregables</p>
                <p className="mt-1 text-sm text-gray-600">Indica el archivo o la ruta y si cada componente aplica a la entrega.</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200/60 bg-white/95 shadow-sm">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700">
                  <tr>
                    <th rowSpan="2" className="border-b border-r border-gray-200 px-3 py-3 text-left">Entregable</th>
                    <th rowSpan="2" className="border-b border-r border-gray-200 px-3 py-3 text-left">Incluye</th>
                    <th rowSpan="2" className="border-b border-r border-gray-200 px-3 py-3 text-left">Ruta/Archivo</th>
                    <th colSpan="2" className="border-b border-gray-200 px-3 py-2 text-center">Entregado</th>
                  </tr>
                  <tr>
                    <th className="border-r border-gray-200 px-3 py-2 text-center">Aplica</th>
                    <th className="px-3 py-2 text-center">No aplica</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Frontend', 'Archivos compilados / proyecto frontend', 'f_ruta', 'entregable_frontend_estado'],
                    ['Backend', 'API / servicios / lógica de negocio', 'b_ruta', 'entregable_backend_estado'],
                    ['Base de Datos', 'Scripts SQL / migraciones', 'bd_ruta', 'entregable_bd_estado'],
                    ['Variables de entorno', 'Variables .env o plantilla de variables necesarias para la operación del sistema.', 'var_entorno', 'entregable_variables_estado'],
                  ].map(([label, include, routeKey, statusKey]) => (
                    <tr key={label} className="border-t border-gray-200 text-gray-700">
                      <th scope="row" className="px-3 py-3 text-left font-semibold text-gray-800">{label}</th>
                      <td className="max-w-[260px] px-3 py-3 leading-snug">{include}</td>
                      <td className="px-3 py-3">
                        <input type="text" name={routeKey} value={formData[routeKey]} onChange={handleChange} className={inputClass} />
                      </td>
                      {['aplica', 'no_aplica'].map((value) => (
                        <td key={value} className="text-center">
                          <input type="radio" name={statusKey} value={value} checked={formData[statusKey] === value} onChange={handleChange} aria-label={`${label}: ${value === 'aplica' ? 'Aplica' : 'No aplica'}`} className="h-4 w-4 accent-[#8A2036]" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'validaciones':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border-l-4 border-[#0f766e] bg-white/80 p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f766e] to-teal-600 text-white shadow-lg">
                <FiCheckCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 tracking-tight">Validación</p>
                <p className="mt-1 text-sm text-gray-600">Registra el resultado de las pruebas y la validación funcional del usuario solicitante.</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200/60 bg-white/95 shadow-sm">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700">
                  <tr>
                    <th rowSpan="2" className="border-b border-r border-gray-200 px-3 py-3 text-left">Validación</th>
                    <th rowSpan="2" className="border-b border-r border-gray-200 px-3 py-3 text-left">Responsable</th>
                    <th colSpan="3" className="border-b border-gray-200 px-3 py-2 text-center">Resultado</th>
                  </tr>
                  <tr>
                    {['Correcto', 'Error', 'No aplica'].map((result) => <th key={result} className="border-r border-gray-200 px-3 py-2 text-center last:border-r-0">{result}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Pruebas funcionales', 'Desarrollo', 'validacion_pruebas_resultado'],
                    ['Validación funcional del usuario solicitante', 'Área usuaria', 'validacion_acceso_resultado'],
                  ].map(([title, responsible, resultKey]) => (
                    <tr key={title} className="border-t border-gray-200 text-gray-700">
                      <th scope="row" className="px-3 py-3 text-left font-medium">{title}</th>
                      <td className="border-l border-gray-200 px-3 py-3">{responsible}</td>
                      {['Correcto', 'Error', 'No aplica'].map((result) => (
                        <td key={result} className="border-l border-gray-200 text-center">
                          <input type="radio" name={resultKey} value={result} checked={formData[resultKey] === result} onChange={handleChange} aria-label={`${title}: ${result}`} className="h-4 w-4 accent-[#8A2036]" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-gray-200/60 bg-white/95 p-5 shadow-sm">
              <label className={labelClass}>Observaciones</label>
              <textarea name="observaciones_finales" value={formData.observaciones_finales} onChange={handleChange} rows={4} className={inputClass} />
            </div>
          </div>
        );

      case 'firmas':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border-l-4 border-[#BC955B] bg-white/80 p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#BC955B] to-[#DAC19A] text-white shadow-lg">
                <FiActivity size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 tracking-tight">Firmas de entrega</p>
                <p className="mt-1 text-sm text-gray-600">Selecciona a los responsables y edita los cargos que aparecerán en el formato.</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {[
                ['Responsable de Recepción y Publicación', 'responsable_infraestructura', 'responsable_infraestructura', 'cargo_infraestructura'],
                ['Responsable de Entrega Técnica', 'responsable_desarrollo', 'responsable_desarrollo', 'cargo_desarrollo'],
              ].map(([title, modal, field, cargoField]) => (
                <div key={field} className="rounded-xl border border-gray-200/60 bg-white/95 p-5 shadow-sm">
                  <label className={labelClass}>{title}</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData[field]} readOnly placeholder="Buscar empleado..." className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 cursor-pointer" onClick={() => openModal(modal)} />
                    <button type="button" onClick={() => openModal(modal)} aria-label={`Buscar ${title}`} className="rounded-lg bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-4 py-3 text-white shadow-md">
                      <FiSearch size={18} />
                    </button>
                  </div>
                  <label className={`${labelClass} mt-4`} htmlFor={cargoField}>Cargo para el PDF</label>
                  <input
                    id={cargoField}
                    type="text"
                    name={cargoField}
                    value={formData[cargoField]}
                    onChange={handleChange}
                    placeholder="Cargo"
                    className={inputClass}
                    style={focusRing}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'generar':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border-l-4 border-[#8A2036] bg-white/80 p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#8A2036] to-[#a9354c] text-white shadow-lg">
                <FiDownload size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 tracking-tight">Generar ficha</p>
                <p className="mt-1 text-sm text-gray-600">Revisa el resumen y genera la ficha de liberación en PDF.</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white/95 shadow-lg backdrop-blur-sm">
              <div className="border-b border-gray-200/60 px-5 py-4">
                <p className="text-sm font-bold uppercase tracking-wide text-gray-700">Resumen de la ficha</p>
              </div>
              <dl className="divide-y divide-gray-200/60">
                {[
                  ['Número de control', formData.numero_control || 'Se asignará al guardar'],
                  ['Fecha de Solicitud', formData.fecha_solicitud || '—'],
                  ['Fecha de Liberación', formData.fecha_liberacion || '—'],
                  ['Líder del proyecto', formData.lider_proyecto || '—'],
                  ['Sistema', formData.nombre_sistema || '—'],
                  ['Versión', formData.version || '—'],
                  ['Ambiente', [formData.ambiente_pruebas && 'Pruebas', formData.ambiente_produccion && 'Producción'].filter(Boolean).join(', ') || '—'],
                  ['Tipo de liberación', formData.tipo_liberacion || '—'],
                  ['Prioridad', formData.prioridad || '—'],
                  ['Entregables', [
                    ['Frontend', formData.entregable_frontend_estado],
                    ['Backend', formData.entregable_backend_estado],
                    ['Base de Datos', formData.entregable_bd_estado],
                    ['Variables de entorno', formData.entregable_variables_estado],
                  ].map(([label, state]) => state ? `${label}: ${state === 'aplica' ? 'Aplica' : 'No aplica'}` : null).filter(Boolean).join(' · ') || '—'],
                  ['Pruebas funcionales', formData.validacion_pruebas_resultado || '—'],
                  ['Validación funcional del usuario solicitante', formData.validacion_acceso_resultado || '—'],
                  ['Responsable de Recepción y Publicación', formData.responsable_infraestructura || '—'],
                  ['Cargo de Infraestructura', formData.cargo_infraestructura || '—'],
                  ['Responsable de Entrega Técnica', formData.responsable_desarrollo || '—'],
                  ['Cargo de Desarrollo', formData.cargo_desarrollo || '—'],
                ].map(([key, val]) => (
                  <div key={key} className="grid grid-cols-1 gap-1 px-5 py-3 text-sm sm:grid-cols-3 sm:gap-2">
                    <dt className="font-medium text-gray-500">{key}</dt>
                    <dd className="text-gray-800 sm:col-span-2">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-colorPrimario border-t-transparent" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 animate-[fadeIn_0.2s_ease-out] rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1 flex-1 bg-gradient-to-r from-[#8A2036] to-[#BC955B] rounded-full" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {mode === 'edit' ? `Editar ficha #${editId}` : 'Nueva ficha de liberación'}
          </span>
          <div className="h-1 flex-1 bg-gradient-to-r from-[#BC955B] to-[#8A2036] rounded-full" />
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              Paso {currentStep + 1} de {STEPS.length}
            </p>
            <h3 className="mt-1 text-base font-bold text-gray-800">{step.label}</h3>
          </div>
          <p className="text-sm font-semibold text-gray-500">
            <span className="text-lg text-[#8A2036]">{String(currentStep + 1).padStart(2, '0')}</span>
            <span className="mx-1">/</span>
            {String(STEPS.length).padStart(2, '0')} pasos
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {STEPS.map((s, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(idx)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Paso ${idx + 1}: ${s.label}`}
                className={`flex min-h-[76px] min-w-0 items-center gap-2 rounded-xl border bg-white px-3 py-3 text-left transition-all sm:min-h-[84px] sm:flex-col sm:justify-center sm:gap-2 sm:text-center ${
                  isActive
                    ? 'shadow-md ring-2 ring-[#8A2036]/15'
                    : isCompleted
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={isActive ? { borderColor: s.color } : undefined}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isActive ? 'text-white' : isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}
                  style={isActive ? { backgroundColor: s.color } : undefined}
                >
                  {isCompleted ? <FiCheckCircle size={18} /> : <s.icon size={17} />}
                </div>
                <span className={`min-w-0 text-xs font-semibold leading-tight ${
                  isActive ? 'text-gray-900' : isCompleted ? 'text-emerald-700' : 'text-gray-500'
                }`}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="space-y-6" aria-labelledby="liberacion-step-title">
        <div className="flex items-start gap-4 rounded-xl border-l-4 bg-white/80 p-5 shadow-sm" style={{ borderColor: step.color }}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100" style={{ color: step.color }}>
            <step.icon size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Paso {currentStep + 1} de {STEPS.length}</p>
            <h3 id="liberacion-step-title" className="mt-1 text-base font-bold text-gray-800">{step.label}</h3>
            <p className="mt-1 text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
        <div className="space-y-6">{renderStepContent()}</div>
      </section>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:border-[#8A2036] hover:text-[#8A2036] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
        >
          <FiArrowLeft />
          Anterior
        </button>

        {currentStep === STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canGenerate}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all ${
              canGenerate ? 'bg-gradient-to-r from-[#8A2036] to-[#a9354c] hover:-translate-y-0.5 hover:shadow-lg' : 'cursor-not-allowed bg-gray-300'
            }`}
          >
            <FiDownload />
            {mode === 'edit' ? 'Actualizar y generar PDF' : 'Guardar y generar PDF'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Siguiente
            <FiArrowRight />
          </button>
        )}
      </div>

      {/* SearchModals para búsqueda de responsables y sistemas */}
      <SearchModal
        isOpen={modals.sistema}
        onClose={() => closeModal('sistema')}
        title="Buscar sistema"
        searchFunction={sistemasService.filtrado}
        onSelect={handleSistemaSelect}
        labelFormatter={(item) => `${item.siglas ? `${item.siglas} - ` : ''}${item.nombre} (${item.version || 'sin versión'})`}
      />
      <SearchModal
        isOpen={modals.lider_proyecto}
        onClose={() => closeModal('lider_proyecto')}
        title="Buscar Líder del Proyecto"
        searchFunction={usersService.filtrado}
        onSelect={handleSearchSelectChange('lider_proyecto_id', 'lider_proyecto')}
        labelFormatter={userDisplayName}
      />
      <SearchModal
        isOpen={modals.responsable_infraestructura}
        onClose={() => closeModal('responsable_infraestructura')}
        title="Buscar Responsable Infraestructura"
        searchFunction={empleadosService.filtrado}
        onSelect={handleSearchSelectChange('responsable_infraestructura_id', 'responsable_infraestructura', 'cargo_infraestructura')}
        labelFormatter={(item) => `${item.nombre || ''} ${item.apellidos || ''}`.trim()}
      />
      <SearchModal
        isOpen={modals.responsable_desarrollo}
        onClose={() => closeModal('responsable_desarrollo')}
        title="Buscar Responsable Desarrollo"
        searchFunction={empleadosService.filtrado}
        onSelect={handleSearchSelectChange('responsable_desarrollo_id', 'responsable_desarrollo', 'cargo_desarrollo')}
        labelFormatter={(item) => `${item.nombre || ''} ${item.apellidos || ''}`.trim()}
      />
    </div>
  );
};

export default LiberacionForm;
