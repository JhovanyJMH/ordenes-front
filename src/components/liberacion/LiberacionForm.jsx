import { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { FiDownload, FiFileText, FiServer, FiCalendar, FiLayers, FiShield, FiCheckCircle, FiGlobe, FiClipboard, FiSettings, FiPackage, FiActivity, FiSearch } from 'react-icons/fi';
import { fetchEmpleados } from '../../features/empleados/empleadosSlice';
import liberacionService from '../../services/liberacionService';
import empleadosService from '../../services/empleadosService';
import usersService from '../../services/usersService';
import { generateLiberacionFichaPdf, buildLiberacionFichaData } from '../../utils/liberacionPdfGenerator';
import SearchModal from '../common/SearchModal';

const initialForm = {
  fecha_solicitud: new Date().toISOString().slice(0, 10),
  fecha_liberacion: new Date().toISOString().slice(0, 10),
  lider_proyecto_id: '',
  lider_proyecto: '',
  nombre_sistema: '',
  version: '',
  ambiente: '',
  tipo_liberacion: '',
  prioridad: '',
  impacto: '',
  url: '',
  puerto_utilizado: '',
  ip_frontend: '',
  ip_backend: '',
  ip_bd: '',
  observaciones: '',
  entregable_frontend: false,
  entregable_backend: false,
  entregable_bd: false,
  entregable_variables: false,
  configuracion_servidor: false,
  configuracion_bd: false,
  configuracion_desarrollo: false,
  asignacion_ip: false,
  publicacion_sistema: false,
  validacion_operativa: false,
  respaldo_previo: false,
  tiempo_validacion: '',
  resultado_liberacion: '',
  observaciones_finales: '',
  validacion_frontend_responsable: '',
  validacion_frontend_resultado: '',
  validacion_backend_responsable: '',
  validacion_backend_resultado: '',
  validacion_migraciones_responsable: '',
  validacion_migraciones_resultado: '',
  validacion_pruebas_responsable: '',
  validacion_pruebas_resultado: '',
  validacion_acceso_responsable: '',
  validacion_acceso_resultado: '',
  validacion_publicacion_responsable: '',
  validacion_publicacion_resultado: '',
  responsable_infraestructura_id: '',
  responsable_infraestructura: '',
  responsable_desarrollo_id: '',
  responsable_desarrollo: '',
  f_ruta: '',
  f_ruta_entregado: '',
  b_ruta: '',
  b_ruta_entregado: '',
  bd_ruta: '',
  bd_ruta_entregado: '',
  var_entorno: '',
  var_entorno_entregado: '',
  estatus: 1,
};

const STEPS = [
  { id: 'generales', label: 'Datos generales', icon: FiClipboard, color: '#8A2036', bg: 'from-[#8A2036]/10 to-[#BC955B]/5' },
  { id: 'tecnica', label: 'Información técnica', icon: FiServer, color: '#1f7a8c', bg: 'from-[#1f7a8c]/10 to-teal-50' },
  { id: 'entregables', label: 'Entregables', icon: FiLayers, color: '#6b46c1', bg: 'from-[#6b46c1]/10 to-violet-50' },
  { id: 'configuracion', label: 'Configuración', icon: FiSettings, color: '#d97706', bg: 'from-amber-100/80 to-orange-50' },
  { id: 'validaciones', label: 'Validaciones', icon: FiCheckCircle, color: '#0f766e', bg: 'from-emerald-100/80 to-teal-50' },
  { id: 'resultados', label: 'Resultados', icon: FiActivity, color: '#BC955B', bg: 'from-[#DAC19A]/30 to-[#BC955B]/10' },
  { id: 'generar', label: 'Generar', icon: FiDownload, color: '#8A2036', bg: 'from-[#8A2036]/10 to-[#BC955B]/5' },
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
  { key: 'nombre_sistema', label: 'Nombre del sistema', icon: FiServer, type: 'text', placeholder: 'Ej. SIR, GI etc.' },
  { key: 'version', label: 'Versión', icon: FiLayers, type: 'text', placeholder: 'Ej. 1.0.0' },
];

const LiberacionForm = ({ mode = 'create', editId = null }) => {
  const dispatch = useDispatch();
  const { list: empleados } = useSelector((state) => state.empleados);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState(null);
  const containerRef = useRef(null);

  // Estado para modales de búsqueda de empleados
  const [modals, setModals] = useState({
    lider_proyecto: false,
    responsable_infraestructura: false,
    responsable_desarrollo: false,
  });

  useEffect(() => {
    dispatch(fetchEmpleados({ page: 1, per_page: 200, search: '' }));
  }, [dispatch]);

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
        responsable_infraestructura: employeeName(data.responsable_infraestructura_data || data.responsable_infraestructura),
        responsable_desarrollo: employeeName(data.responsable_desarrollo_data || data.responsable_desarrollo),
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
    return formData.lider_proyecto && formData.nombre_sistema && formData.version && formData.ambiente;
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

      if (type === 'radio' && (value === 'true' || value === 'false')) {
        nextValue = value === 'true';
      }

      if (name === 'observaciones_finales') {
        nextValue = value.toUpperCase().slice(0, 255);
      }

      return {
        ...prev,
        [name]: nextValue,
      };
    });
  };

  const handleEmpleadoSelect = (fieldId, fieldName, value) => {
    const selected = empleados.find((emp) => String(emp.id) === String(value));
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value || '',
      [fieldName]: selected ? `${selected.nombre || ''} ${selected.apellidos || ''}`.trim() : '',
    }));
  };

  const openModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  };

  const handleSearchSelectChange = (fieldId, fieldName) => (option) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: option?.value || '',
      [fieldName]: option?.label || '',
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
        var_entorno: formData.var_entorno || formData.observaciones,
        var_entorno_entregado: formData.var_entorno_entregado || formData.observaciones_finales,
        f_ruta: formData.f_ruta || formData.url,
        f_ruta_entregado: formData.f_ruta_entregado || formData.ip_frontend,
        b_ruta: formData.b_ruta || formData.ip_backend,
        b_ruta_entregado: formData.b_ruta_entregado || formData.ip_backend,
        bd_ruta: formData.bd_ruta || formData.ip_bd,
        bd_ruta_entregado: formData.bd_ruta_entregado || formData.ip_bd,
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
                {fieldConfig.map(({ key, label, icon: Icon, type, placeholder }) => (
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
                          className={inputClass}
                          style={focusRing}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { title: 'Ambiente', name: 'ambiente', options: ['Desarrollo', 'Pruebas', 'Producción'] },
                { title: 'Tipo de liberación', name: 'tipo_liberacion', options: ['Nueva versión', 'Corrección', 'Mejora'] },
                { title: 'Prioridad', name: 'prioridad', options: ['Alta', 'Media', 'Baja'] },
              ].map(({ title, name, options }) => (
                <div key={name} className="rounded-xl border border-gray-200/60 bg-white/95 p-5 shadow-lg backdrop-blur-sm">
                  <h3 className="mb-4 text-sm font-bold text-gray-800 tracking-tight">{title}</h3>
                  <div className="space-y-3">
                    {options.map((opt) => (
                      <label key={opt} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={name}
                          value={opt}
                          checked={formData[name] === opt}
                          onChange={handleChange}
                          className="h-4 w-4 border-gray-300 text-[#8A2036] focus:ring-2 focus:ring-[#8A2036]/20"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="md:col-span-3 rounded-xl border border-gray-200/60 bg-white/95 p-5 shadow-lg backdrop-blur-sm">
                <h3 className="mb-4 text-sm font-bold text-gray-800 tracking-tight">Impacto</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {['Crítico', 'Moderado', 'Bajo'].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="impacto"
                        value={opt}
                        checked={formData.impacto === opt}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300 text-[#8A2036] focus:ring-2 focus:ring-[#8A2036]/20"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'tecnica':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border-l-4 border-[#1f7a8c] bg-white/80 p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1f7a8c] to-teal-600 text-white shadow-lg">
                <FiServer size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 tracking-tight">Información técnica</p>
                <p className="mt-1 text-sm text-gray-600">Detalles de URLs, puertos y direcciones IP.</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200/60 bg-white/95 p-6 shadow-lg backdrop-blur-sm">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>URL</label>
                  <input type="text" name="url" value={formData.url} onChange={handleChange} placeholder="https://sistema.com" className={inputClass} style={focusRing} />
                </div>
                <div>
                  <label className={labelClass}>Puerto</label>
                  <input type="text" name="puerto_utilizado" value={formData.puerto_utilizado} onChange={handleChange} placeholder="8080" className={inputClass} style={focusRing} />
                </div>
                <div>
                  <label className={labelClass}>IP Frontend</label>
                  <input type="text" name="ip_frontend" value={formData.ip_frontend} onChange={handleChange} placeholder="10.0.0.5" className={inputClass} style={focusRing} />
                </div>
                <div>
                  <label className={labelClass}>IP Backend</label>
                  <input type="text" name="ip_backend" value={formData.ip_backend} onChange={handleChange} placeholder="10.0.0.7" className={inputClass} style={focusRing} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>IP Base de Datos</label>
                  <input type="text" name="ip_bd" value={formData.ip_bd} onChange={handleChange} placeholder="10.0.0.9" className={inputClass} style={focusRing} />
                </div>
              </div>
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
                <p className="mt-1 text-sm text-gray-600">Rutas de los componentes del proyecto.</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white/95 shadow-lg backdrop-blur-sm">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_80px_80px] border-b border-gray-200/60 bg-white/95 text-xs font-semibold uppercase tracking-wide text-gray-700">
                <div className="px-3 py-2">Entregable</div>
                <div className="border-l border-gray-200/60 px-3 py-2">Incluye</div>
                <div className="border-l border-gray-200/60 px-2 py-2 text-center">Completa</div>
                <div className="border-l border-gray-200/60 px-2 py-2 text-center">Parcial</div>
              </div>
              {[
                ['Frontend', 'f_ruta', 'entregable_frontend'],
                ['Backend', 'b_ruta', 'entregable_backend'],
                ['Base de Datos', 'bd_ruta', 'entregable_bd'],
                ['Variables de entorno', 'var_entorno', 'entregable_variables'],
              ].map(([label, rutaKey, entregableKey]) => (
                <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_80px_80px] border-b border-gray-200 last:border-b-0 text-sm text-gray-700">
                  <div className="px-3 py-2.5 font-medium text-gray-800">{label}</div>
                  <div className="border-l border-gray-200 px-2 py-2">
                    <input
                      type="text"
                      name={rutaKey}
                      value={formData[rutaKey]}
                      onChange={handleChange}
                      placeholder={label === 'Variables de entorno' ? 'APP_ENV=production' : '/ruta'}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="border-l border-gray-200 px-1 py-2">
                    <label className="flex h-full items-center justify-center">
                      <input
                        type="radio"
                        name={entregableKey}
                        value="true"
                        checked={Boolean(formData[entregableKey])}
                        onChange={handleChange}
                        className="h-4 w-4 accent-blue-600"
                      />
                    </label>
                  </div>
                  <div className="border-l border-gray-200 px-1 py-2">
                    <label className="flex h-full items-center justify-center">
                      <input
                        type="radio"
                        name={entregableKey}
                        value="false"
                        checked={!Boolean(formData[entregableKey])}
                        onChange={handleChange}
                        className="h-4 w-4 accent-blue-600"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'configuracion':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border-l-4 border-[#d97706] bg-white/80 p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#d97706] to-orange-600 text-white shadow-lg">
                <FiSettings size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 tracking-tight">Configuración de infraestructura</p>
                <p className="mt-1 text-sm text-gray-600">Actividades de configuración y validación.</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white/95 shadow-lg backdrop-blur-sm">
              <div className="grid grid-cols-[minmax(0,1fr)_180px] border-b border-gray-200/60 bg-white/95 text-xs font-semibold uppercase tracking-wide text-gray-700">
                <div className="px-3 py-2">Actividad</div>
                <div className="border-l border-gray-200/60 px-2 py-2">
                  <div className="text-center">Estatus</div>
                  <div className="mt-1 grid grid-cols-2 border-t border-gray-200/60">
                    <div className="px-2 py-1 text-center">Si</div>
                    <div className="border-l border-gray-200/60 px-2 py-1 text-center">No</div>
                  </div>
                </div>
              </div>
              {[
                ['configuracion_servidor', 'Configuración del servidor (Apache, PHP, permisos)'],
                ['configuracion_bd', 'Configuración de Base de Datos'],
                ['asignacion_ip', 'Asignación de IP'],
                ['publicacion_sistema', 'Publicación del sistema'],
                ['validacion_operativa', 'Validación operativa posterior a la liberación'],
                ['respaldo_previo', 'Respaldo previo realizado y validado'],
              ].map(([key, label]) => (
                <div key={key} className="grid grid-cols-[minmax(0,1fr)_180px] border-b border-gray-200 last:border-b-0 text-sm text-gray-700">
                  <div className="px-3 py-2.5 leading-snug">{label}</div>
                  <div className="border-l border-gray-200">
                    <div className="grid h-full grid-cols-2">
                      <label className="flex cursor-pointer items-center justify-center border-r border-gray-200 px-1 py-2">
                        <input
                          type="radio"
                          name={key}
                          value="true"
                          checked={Boolean(formData[key])}
                          onChange={handleChange}
                          className="h-4 w-4 accent-[#8A2036]"
                        />
                      </label>
                      <label className="flex cursor-pointer items-center justify-center px-1 py-2">
                        <input
                          type="radio"
                          name={key}
                          value="false"
                          checked={!Boolean(formData[key])}
                          onChange={handleChange}
                          className="h-4 w-4 accent-[#8A2036]"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
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
                <p className="text-sm font-bold text-gray-800 tracking-tight">Validaciones previas</p>
                <p className="mt-1 text-sm text-gray-600">Registro de responsables y resultados de validación.</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white/95 shadow-lg backdrop-blur-sm">
              <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_180px] border-b border-gray-200/60 bg-white/95 text-xs font-semibold uppercase tracking-wide text-gray-700">
                <div className="px-3 py-2">Validación</div>
                <div className="border-l border-gray-200/60 px-3 py-2">Responsable</div>
                <div className="border-l border-gray-200/60 px-2 py-2">
                  <div className="text-center">Resultado</div>
                  <div className="mt-1 grid grid-cols-2 border-t border-gray-200/60">
                    <div className="px-2 py-1 text-center">Correcto</div>
                    <div className="border-l border-gray-200/60 px-2 py-1 text-center">Error</div>
                  </div>
                </div>
              </div>
              {[
                ['Compilación Frontend', 'validacion_frontend_responsable', 'validacion_frontend_resultado'],
                ['Validación Backend', 'validacion_backend_responsable', 'validacion_backend_resultado'],
                ['Ejecución de migraciones', 'validacion_migraciones_responsable', 'validacion_migraciones_resultado'],
                ['Pruebas funcionales', 'validacion_pruebas_responsable', 'validacion_pruebas_resultado'],
                ['Validación de acceso', 'validacion_acceso_responsable', 'validacion_acceso_resultado'],
                ['Validación de publicación en el entorno de ambiente', 'validacion_publicacion_responsable', 'validacion_publicacion_resultado'],
              ].map(([title, responsableKey, resultadoKey]) => (
                <div key={title} className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_180px] border-b border-gray-200 last:border-b-0 text-sm text-gray-700">
                  <div className="px-3 py-2.5 leading-snug">{title}</div>
                  <div className="border-l border-gray-200 px-2 py-2">
                    <input
                      type="text"
                      name={responsableKey}
                      value={formData[responsableKey]}
                      onChange={handleChange}
                      placeholder="Responsable"
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="border-l border-gray-200">
                    <div className="grid h-full grid-cols-2">
                      <label className="flex cursor-pointer items-center justify-center border-r border-gray-200 px-1 py-2">
                        <input
                          type="radio"
                          name={resultadoKey}
                          value="Correcto"
                          checked={String(formData[resultadoKey] || '').toLowerCase().includes('correcto')}
                          onChange={handleChange}
                          className="h-4 w-4 accent-[#8A2036]"
                        />
                      </label>
                      <label className="flex cursor-pointer items-center justify-center px-1 py-2">
                        <input
                          type="radio"
                          name={resultadoKey}
                          value="Error"
                          checked={String(formData[resultadoKey] || '').toLowerCase().includes('error')}
                          onChange={handleChange}
                          className="h-4 w-4 accent-[#8A2036]"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'resultados':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border-l-4 border-[#BC955B] bg-white/80 p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#BC955B] to-[#DAC19A] text-white shadow-lg">
                <FiActivity size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 tracking-tight">Resultados de la liberación</p>
                <p className="mt-1 text-sm text-gray-600">Resultado final, tiempo de validación y observaciones.</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200/60 bg-white/95 p-6 shadow-lg backdrop-blur-sm">
              <div className="mb-5">
                <label className={labelClass}>Resultado de la liberación</label>
                <div className="grid gap-3 md:grid-cols-3">
                  {['Liberación Exitosa', 'Liberación Parcial', 'Liberación Rechazada'].map((opt) => (
                    <label key={opt} className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                      formData.resultado_liberacion === opt 
                        ? 'border-current bg-white shadow-md' 
                        : 'border-gray-200/60 bg-gray-50/80 text-gray-500 hover:border-gray-300'
                    }`} style={formData.resultado_liberacion === opt ? { borderColor: step.color, color: step.color } : {}}>
                      <input
                        type="radio"
                        name="resultado_liberacion"
                        value={opt}
                        checked={formData.resultado_liberacion === opt}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Tiempo de validación</label>
                  <input type="text" name="tiempo_validacion" value={formData.tiempo_validacion} onChange={handleChange} placeholder="Ej. 30 minutos" className={inputClass} style={focusRing} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Observaciones finales</label>
                  <textarea name="observaciones_finales" value={formData.observaciones_finales} onChange={handleChange} rows={3} placeholder="Observaciones generales del proceso (Máx. 255 caracteres)" className={inputClass} style={focusRing} />
                  <p className="mt-1 text-xs text-gray-500">{formData.observaciones_finales.length}/255 caracteres</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200/60 bg-white/95 p-6 shadow-lg backdrop-blur-sm">
              <p className="mb-4 border-b border-gray-200/60 pb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Responsables</p>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Responsable infraestructura</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.responsable_infraestructura}
                      readOnly
                      placeholder="Buscar empleado..."
                      className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:border-[#8A2036] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/20 transition-all shadow-sm cursor-pointer"
                      onClick={() => openModal('responsable_infraestructura')}
                      style={focusRing}
                    />
                    <button
                      type="button"
                      onClick={() => openModal('responsable_infraestructura')}
                      className="rounded-lg bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-4 py-3 text-white transition-all hover:brightness-110 shadow-md"
                    >
                      <FiSearch size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Responsable desarrollo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.responsable_desarrollo}
                      readOnly
                      placeholder="Buscar empleado..."
                      className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:border-[#8A2036] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/20 transition-all shadow-sm cursor-pointer"
                      onClick={() => openModal('responsable_desarrollo')}
                      style={focusRing}
                    />
                    <button
                      type="button"
                      onClick={() => openModal('responsable_desarrollo')}
                      className="rounded-lg bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-4 py-3 text-white transition-all hover:brightness-110 shadow-md"
                    >
                      <FiSearch size={18} />
                    </button>
                  </div>
                </div>
              </div>
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
                  ['Sistema', formData.nombre_sistema || '—'],
                  ['Líder del proyecto', formData.lider_proyecto || '—'],
                  ['Versión', formData.version || '—'],
                  ['Ambiente', formData.ambiente || '—'],
                  ['Tipo de liberación', formData.tipo_liberacion || '—'],
                  ['Prioridad', formData.prioridad || '—'],
                  ['Impacto', formData.impacto || '—'],
                  ['URL', formData.url || '—'],
                  ['Resultado', formData.resultado_liberacion || '—'],
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

      <div className="mb-8 hidden lg:block">
        <div className="grid grid-cols-3 gap-3 xl:grid-cols-7">
          {STEPS.map((s, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div key={s.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => goToStep(idx)}
                  className={`group relative flex min-h-[80px] w-full flex-col items-center justify-center gap-2 rounded-xl px-3 py-3 text-center transition-all duration-300 ${
                    isActive 
                      ? 'bg-white shadow-xl ring-2 ring-[#8A2036]/20 transform scale-105' 
                      : isCompleted
                      ? 'bg-white/70 hover:bg-white/90'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-[#8A2036] to-[#a9354c] text-white shadow-lg' 
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={`truncate text-xs font-medium tracking-wide ${
                    isActive 
                      ? 'text-gray-800' 
                      : isCompleted
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`rounded-2xl bg-gradient-to-br p-8 shadow-2xl ${step.bg}`}>
        {renderStepContent()}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="group flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-[#8A2036] hover:text-[#8A2036] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-600 shadow-sm"
        >
          <span>Anterior</span>
        </button>

        {currentStep === STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canGenerate}
            className={`group flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all shadow-lg ${
              canGenerate 
                ? 'bg-gradient-to-r from-[#8A2036] to-[#a9354c] hover:from-[#a9354c] hover:to-[#8A2036] hover:shadow-xl transform hover:-translate-y-0.5' 
                : 'cursor-not-allowed bg-gray-300'
            }`}
          >
            <FiDownload />
            <span>{mode === 'edit' ? 'Actualizar ficha' : 'Generar ficha'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-6 py-3 text-sm font-semibold text-white transition-all hover:from-[#a9354c] hover:to-[#8A2036] hover:shadow-xl transform hover:-translate-y-0.5 shadow-lg"
          >
            <span>Siguiente</span>
            <span className="transform transition-transform group-hover:translate-x-1">→</span>
          </button>
        )}
      </div>

      {/* SearchModals para búsqueda de empleados */}
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
        onSelect={handleSearchSelectChange('responsable_infraestructura_id', 'responsable_infraestructura')}
        labelFormatter={(item) => `${item.nombre || ''} ${item.apellidos || ''}`.trim()}
      />
      <SearchModal
        isOpen={modals.responsable_desarrollo}
        onClose={() => closeModal('responsable_desarrollo')}
        title="Buscar Responsable Desarrollo"
        searchFunction={empleadosService.filtrado}
        onSelect={handleSearchSelectChange('responsable_desarrollo_id', 'responsable_desarrollo')}
        labelFormatter={(item) => `${item.nombre || ''} ${item.apellidos || ''}`.trim()}
      />
    </div>
  );
};

export default LiberacionForm;
