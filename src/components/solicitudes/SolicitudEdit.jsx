import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSolicitudById, updateSolicitud, clearError } from '../../features/solicitudes/solicitudesSlice';
import { useNavigate, useParams } from 'react-router-dom';
import CustomSelect from '../common/CustomSelect';
import SearchModal from '../common/SearchModal';
import Swal from 'sweetalert2';
import serviciosService from '../../services/serviciosService';
import adscripcionesService from '../../services/adscripcionesService';
import empleadosService from '../../services/empleadosService';
import equiposService from '../../services/equiposService';
import refaccionesService from '../../services/refaccionesService';
import {
  FiClipboard,
  FiSearch,
  FiSettings,
  FiPackage,
  FiCheckCircle,
  FiChevronRight,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiUser,
  FiMonitor,
} from 'react-icons/fi';
import {
  STEP_FIELDS,
  EVALUACION_OPTIONS,
  evaluacionLabel,
  buildSolicitudPayload,
  inputClass,
  labelClass,
} from './solicitudFormUtils';

const STEPS = [
  { id: 'solicitud', label: 'Solicitud', icon: FiClipboard, color: '#8A2036', bg: 'from-[#8A2036]/10 to-[#BC955B]/5' },
  { id: 'diagnostico', label: 'Diagnóstico', icon: FiSearch, color: '#1f7a8c', bg: 'from-[#1f7a8c]/10 to-teal-50' },
  { id: 'servicio', label: 'Servicio', icon: FiSettings, color: '#6b46c1', bg: 'from-[#6b46c1]/10 to-violet-50' },
  { id: 'refacciones', label: 'Refacciones', icon: FiPackage, color: '#d97706', bg: 'from-amber-100/80 to-orange-50' },
  { id: 'evaluacion', label: 'Evaluación', emoji: '😊', color: '#0f766e', bg: 'from-emerald-100/80 to-teal-50' },
  { id: 'cerrar', label: 'Cerrar', icon: FiCheckCircle, color: '#BC955B', bg: 'from-[#DAC19A]/30 to-[#BC955B]/10' },
];

const INITIAL_FORM = {
  servicio_id: '',
  adscripcion_id: '',
  empleado_id: '',
  equipo_id: '',
  descripcion: '',
  fecha: '',
  hora: '',
  indicador_equipo: '0',
  estatus: '1',
  fecha_diag: '',
  hora_diag: '',
  descripcion_diag: '',
  fecha_diag_entrega: '',
  hora_diag_entrega: '',
  fecha_ser: '',
  hora_ser: '',
  utilizados_ser: '',
  descripcion_ser: '',
  observaciones_ser: '',
  licenciamiento_ser: '0',
  winoriginal_ser: '0',
  ofioriginal_ser: '0',
  cantidad_ser: '',
  evaluacion_ser: '0',
};

const SolicitudEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const containerRef = useRef(null);
  const { selected, loading, error } = useSelector((s) => s.solicitudes);

  const [currentStep, setCurrentStep] = useState(0);
  const [savingStep, setSavingStep] = useState(false);
  const [savedSteps, setSavedSteps] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [refaccionItems, setRefaccionItems] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [animKey, setAnimKey] = useState(0);

  // Estado para modales de búsqueda
  const [modals, setModals] = useState({
    servicio: false,
    adscripcion: false,
    empleado: false,
    equipo: false,
    refaccion: false,
  });

  // Mantener labels seleccionados
  const [selectedLabels, setSelectedLabels] = useState({
    servicio_id: '',
    adscripcion_id: '',
    empleado_id: '',
    equipo_id: '',
  });

  // Mantener labels de refacciones seleccionadas
  const [refaccionLabels, setRefaccionLabels] = useState({});

  useEffect(() => {
    dispatch(getSolicitudById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selected) {
      const evalVal = Number(selected.evaluacion_ser);
      const normalizedEval = evalVal === 5 ? '4' : String(selected.evaluacion_ser ?? '0');

      setForm({
        servicio_id: selected.servicio_id || '',
        adscripcion_id: selected.adscripcion_id || '',
        empleado_id: selected.empleado_id || '',
        equipo_id: selected.equipo_id || '',
        descripcion: selected.descripcion || '',
        fecha: selected.fecha ? String(selected.fecha).slice(0, 10) : '',
        hora: selected.hora ? String(selected.hora).slice(0, 5) : '',
        indicador_equipo: String(selected.indicador_equipo ?? '0'),
        estatus: String(selected.estatus ?? '1'),
        fecha_diag: selected.fecha_diag ? String(selected.fecha_diag).slice(0, 10) : '',
        hora_diag: selected.hora_diag ? String(selected.hora_diag).slice(0, 5) : '',
        descripcion_diag: selected.descripcion_diag || '',
        fecha_diag_entrega: selected.fecha_diag_entrega ? String(selected.fecha_diag_entrega).slice(0, 10) : '',
        hora_diag_entrega: selected.hora_diag_entrega ? String(selected.hora_diag_entrega).slice(0, 5) : '',
        fecha_ser: selected.fecha_ser ? String(selected.fecha_ser).slice(0, 10) : '',
        hora_ser: selected.hora_ser ? String(selected.hora_ser).slice(0, 5) : '',
        utilizados_ser: selected.utilizados_ser || '',
        descripcion_ser: selected.descripcion_ser || '',
        observaciones_ser: selected.observaciones_ser || '',
        licenciamiento_ser: String(selected.licenciamiento_ser ?? '0'),
        winoriginal_ser: String(selected.winoriginal_ser ?? '0'),
        ofioriginal_ser: String(selected.ofioriginal_ser ?? '0'),
        cantidad_ser: selected.cantidad_ser ?? '',
        evaluacion_ser: normalizedEval,
      });
      setRefaccionItems(
        (selected.refacciones || []).map((r) => ({
          refaccion_id: r.id,
          cantidad: r.pivot?.cantidad || 1,
        }))
      );
      setSavedSteps(new Set(['solicitud', 'diagnostico', 'servicio', 'refacciones', 'evaluacion'].filter((key) => {
        if (key === 'diagnostico') return !!selected.descripcion_diag;
        if (key === 'servicio') return !!selected.descripcion_ser;
        if (key === 'refacciones') return (selected.refacciones?.length > 0) || !!selected.utilizados_ser;
        if (key === 'evaluacion') return Number(selected.evaluacion_ser) > 0;
        return !!selected.descripcion;
      })));

      // Cargar labels seleccionados
      setSelectedLabels({
        servicio_id: selected.servicio?.descripcion || '',
        adscripcion_id: selected.adscripcion ? `${selected.adscripcion.codigo} — ${selected.adscripcion.descripcion}` : '',
        empleado_id: selected.empleado ? `${selected.empleado.nombre} ${selected.empleado.apellidos}` : '',
        equipo_id: selected.equipo ? `${selected.equipo.inventario} — ${selected.equipo.marca} ${selected.equipo.modelo}` : '',
      });

      // Cargar labels de refacciones
      const labels = {};
      (selected.refacciones || []).forEach((r) => {
        labels[r.id] = r.descripcion;
      });
      setRefaccionLabels(labels);
    }
  }, [selected]);

  useEffect(() => {
    if (error) {
      Swal.fire('Error', error, 'error');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    setAnimKey((k) => k + 1);
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2800);
  };

  const setIndicadorEquipo = (aplica) => {
    setForm((f) => ({
      ...f,
      indicador_equipo: aplica ? '1' : '0',
      equipo_id: aplica ? f.equipo_id : '',
    }));
  };

  const openModal = (modalName) => setModals((m) => ({ ...m, [modalName]: true }));
  const closeModal = (modalName) => setModals((m) => ({ ...m, [modalName]: false }));

  const handleRefaccionSelectChange = (idx) => (option) => {
    const next = [...refaccionItems];
    next[idx] = { ...next[idx], refaccion_id: option?.value ?? '' };
    setRefaccionItems(next);
    setRefaccionLabels((labels) => ({
      ...labels,
      [option?.value]: option?.label || '',
    }));
  };

  const handleSearchSelectChange = (name) => (option) => {
    setForm((f) => ({ ...f, [name]: option?.value ?? '' }));
    setSelectedLabels((s) => ({ ...s, [name]: option?.label || '' }));
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const numericFields = ['servicio_id', 'adscripcion_id', 'empleado_id', 'equipo_id', 'cantidad_ser', 'evaluacion_ser'];
    const dateFields = ['fecha', 'hora', 'fecha_diag', 'hora_diag', 'fecha_diag_entrega', 'hora_diag_entrega', 'fecha_ser', 'hora_ser'];
    const processedValue = type === 'checkbox' 
      ? (checked ? '1' : '0') 
      : numericFields.includes(name) || dateFields.includes(name)
        ? value 
        : value.toUpperCase();
    setForm((f) => ({ ...f, [name]: processedValue }));
  };

  const setLicenciamiento = (aplica) => {
    setForm((f) => ({
      ...f,
      licenciamiento_ser: aplica ? '1' : '0',
      winoriginal_ser: aplica ? f.winoriginal_ser : '0',
      ofioriginal_ser: aplica ? f.ofioriginal_ser : '0',
    }));
  };

  const goToStep = (idx) => setCurrentStep(idx);

  const saveCurrentStep = async ({ advance = false, finalize = false } = {}) => {
    const stepId = STEPS[currentStep].id;
    const fields = STEP_FIELDS[stepId];

    if (stepId === 'solicitud' && !form.descripcion.trim()) {
      Swal.fire('Campo requerido', 'La descripción es obligatoria.', 'warning');
      return false;
    }

    setSavingStep(true);
    try {
      const extra = stepId === 'refacciones'
        ? { refacciones: refaccionItems.filter((r) => r.refaccion_id) }
        : {};
      const payload = buildSolicitudPayload(form, fields, extra);
      await dispatch(updateSolicitud({ id, data: payload })).unwrap();
      setSavedSteps((prev) => new Set([...prev, stepId]));

      const toastText = finalize
        ? 'Solicitud finalizada correctamente'
        : `Etapa "${STEPS[currentStep].label}" guardada`;

      showToast(toastText);

      if (finalize) {
        window.setTimeout(() => navigate('/solicitudes'), 600);
      } else if (advance && currentStep < STEPS.length - 1) {
        setCurrentStep((s) => s + 1);
      }
      return true;
    } catch (err) {
      Swal.fire('Error al guardar', err || 'No se pudo actualizar', 'error');
      return false;
    } finally {
      setSavingStep(false);
    }
  };

  const step = STEPS[currentStep];
  const focusRing = { '--tw-ring-color': step.color };
  const isBusy = loading || savingStep;

  const YesNoCards = ({ value, onChange, yesLabel = 'Sí', noLabel = 'No' }) => (
    <div className="mt-2 grid grid-cols-2 gap-3">
      {[
        { val: '1', label: yesLabel },
        { val: '0', label: noLabel },
      ].map(({ val, label }) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val === '1')}
          className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-all ${
            (value === '1' && val === '1') || (value !== '1' && val === '0')
              ? 'border-current bg-white shadow-md'
              : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
          }`}
          style={(value === '1' && val === '1') || (value !== '1' && val === '0') ? { borderColor: step.color, color: step.color } : {}}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (step.id) {
      case 'solicitud':
        return (
          <div className="grid grid-cols-1 gap-6">
            {/* Datos del solicitante - ocupa todo el ancho */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                <div>
                  <label className={labelClass}>servicio *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedLabels.servicio_id}
                      readOnly
                      placeholder="Selecciona un servicio..."
                      className={`${inputClass} ${selectedLabels.servicio_id ? 'bg-green-50 border-green-200' : 'bg-gray-50'} pr-12 transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => openModal('servicio')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-all ${
                        selectedLabels.servicio_id 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <FiSearch size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Adscripción *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedLabels.adscripcion_id}
                      readOnly
                      placeholder="Selecciona una adscripción..."
                      className={`${inputClass} ${selectedLabels.adscripcion_id ? 'bg-green-50 border-green-200' : 'bg-gray-50'} pr-12 transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => openModal('adscripcion')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-all ${
                        selectedLabels.adscripcion_id 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <FiSearch size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Empleado *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedLabels.empleado_id}
                      readOnly
                      placeholder="Selecciona un empleado..."
                      className={`${inputClass} ${selectedLabels.empleado_id ? 'bg-green-50 border-green-200' : 'bg-gray-50'} pr-12 transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => openModal('empleado')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-all ${
                        selectedLabels.empleado_id 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <FiSearch size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SOLICITUD: */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-colorPrimario/20 focus-within:border-colorPrimario/30">
              <div className="flex items-center justify-between">
                <label className={labelClass}>SOLICITUD: *</label>
                <span className={`text-xs font-medium ${form.descripcion.length > 250 ? 'text-red-500' : 'text-gray-400'}`}>
                  {form.descripcion.length}/250
                </span>
              </div>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
                maxLength={250}
                className={inputClass}
                placeholder="Ej: Equipo no enciende, solicitud de instalación de software, reubicación de nodos de red..."
              />
            </div>

            {/* Fecha y hora + Equipo físico en la misma fila */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-colorPrimario">
                  <FiCalendar size={18} />
                  <span className="text-sm font-bold uppercase tracking-wide">Fecha y hora</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Fecha *</label>
                    <input 
                      type="date" 
                      name="fecha" 
                      value={form.fecha} 
                      onChange={handleChange} 
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Hora *</label>
                    <input 
                      type="time" 
                      name="hora" 
                      value={form.hora} 
                      onChange={handleChange} 
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-colorPrimario">
                  <FiMonitor size={18} />
                  <span className="text-sm font-bold uppercase tracking-wide">Equipo físico</span>
                </div>
                <p className={labelClass}>¿La solicitud incluye equipo?</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {[
                    { val: '0', label: 'No', desc: '', icon: '💻' },
                    { val: '1', label: 'Sí', desc: '', icon: '🖥️' },
                  ].map(({ val, label, desc, icon }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setIndicadorEquipo(val === '1')}
                      className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                        form.indicador_equipo === val
                          ? 'border-colorPrimario bg-gradient-to-br from-colorPrimario/5 to-colorPrimario/10 shadow-md ring-2 ring-colorPrimario/30'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {form.indicador_equipo === val && (
                        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-colorPrimario text-white">
                          <FiCheckCircle size={12} />
                        </div>
                      )}
                      <span className="text-2xl">{icon}</span>
                      <span className="mt-1 block font-bold text-gray-800">{label}</span>
                      <span className="text-xs text-gray-500">{desc}</span>
                    </button>
                  ))}
                </div>

                {form.indicador_equipo === '1' && (
                  <div className="relative z-0 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className={labelClass}>Equipo *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedLabels.equipo_id}
                        readOnly
                        placeholder="Selecciona un equipo..."
                        className={`${inputClass} ${selectedLabels.equipo_id ? 'bg-green-50 border-green-200' : 'bg-gray-50'} pr-12 transition-colors`}
                      />
                      <button
                        type="button"
                        onClick={() => openModal('equipo')}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-all ${
                          selectedLabels.equipo_id 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <FiSearch size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SearchModals */}
            <SearchModal
              isOpen={modals.servicio}
              onClose={() => closeModal('servicio')}
              title="Buscar servicio"
              searchFunction={serviciosService.filtrado}
              onSelect={handleSearchSelectChange('servicio_id')}
              labelField="descripcion"
            />
            <SearchModal
              isOpen={modals.adscripcion}
              onClose={() => closeModal('adscripcion')}
              title="Buscar adscripción"
              searchFunction={adscripcionesService.filtrado}
              onSelect={handleSearchSelectChange('adscripcion_id')}
              labelFormatter={(item) => `${item.codigo} — ${item.descripcion}`}
            />
            <SearchModal
              isOpen={modals.empleado}
              onClose={() => closeModal('empleado')}
              title="Buscar empleado"
              searchFunction={empleadosService.filtrado}
              onSelect={handleSearchSelectChange('empleado_id')}
              labelFormatter={(item) => `${item.nombre} ${item.apellidos}`}
            />
            <SearchModal
              isOpen={modals.equipo}
              onClose={() => closeModal('equipo')}
              title="Buscar equipo"
              searchFunction={equiposService.filtrado}
              onSelect={handleSearchSelectChange('equipo_id')}
              labelFormatter={(item) => `${item.inventario} — ${item.marca} ${item.modelo}`}
            />
          </div>
        );

      case 'diagnostico':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-3 border-l-4 border-[#1f7a8c] bg-[#1f7a8c]/5 px-5 py-4">
              <FiSearch className="mt-0.5 shrink-0 text-[#1f7a8c]" size={18} />
              <div>
                <p className="text-sm font-bold text-gray-800">Análisis técnico</p>
                <p className="mt-1 text-sm text-gray-600">Registra los hallazgos, la causa y la fecha estimada de entrega.</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
                <p className="text-sm font-bold uppercase tracking-wide text-gray-700">Registro del diagnóstico</p>
                <span className="text-xs font-medium text-gray-400">Información técnica</span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Descripción del diagnóstico</label>
                  <textarea name="descripcion_diag" value={form.descripcion_diag} onChange={handleChange} rows={5} maxLength={255} className={inputClass} style={focusRing} placeholder="Hallazgos, causa raíz, recomendaciones..." />
                  <div className="mt-1 text-right text-xs text-gray-400">
                    {form.descripcion_diag.length}/255
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Fecha diagnóstico</label>
                  <input type="date" name="fecha_diag" value={form.fecha_diag} onChange={handleChange} className={inputClass} style={focusRing} />
                </div>
                <div>
                  <label className={labelClass}>Hora diagnóstico</label>
                  <input type="time" name="hora_diag" value={form.hora_diag} onChange={handleChange} className={inputClass} style={focusRing} />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-4 border-b border-gray-100 pb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Entrega estimada</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Fecha entrega estimada</label>
                  <input type="date" name="fecha_diag_entrega" value={form.fecha_diag_entrega} onChange={handleChange} className={inputClass} style={focusRing} />
                </div>
                <div>
                  <label className={labelClass}>Hora entrega estimada</label>
                  <input type="time" name="hora_diag_entrega" value={form.hora_diag_entrega} onChange={handleChange} className={inputClass} style={focusRing} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'servicio':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-3 border-l-4 border-[#6b46c1] bg-[#6b46c1]/5 px-5 py-4">
              <FiSettings className="mt-0.5 shrink-0 text-[#6b46c1]" size={18} />
              <div>
                <p className="text-sm font-bold text-gray-800">Ejecución del servicio</p>
                <p className="mt-1 text-sm text-gray-600">Documenta el trabajo realizado, los materiales y el licenciamiento aplicado.</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
                <p className="text-sm font-bold uppercase tracking-wide text-gray-700">Detalle del servicio</p>
                <span className="text-xs font-medium text-gray-400">Registro de atención</span>
              </div>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div>
                <label className={labelClass}>Fecha del servicio</label>
                <input type="date" name="fecha_ser" value={form.fecha_ser} onChange={handleChange} className={inputClass} style={focusRing} />
              </div>
              <div>
                <label className={labelClass}>Hora del servicio</label>
                <input type="time" name="hora_ser" value={form.hora_ser} onChange={handleChange} className={inputClass} style={focusRing} />
              </div>
              <div>
                <label className={labelClass}>Cantidad</label>
                <input type="number" min="0" name="cantidad_ser" value={form.cantidad_ser} onChange={handleChange} className={inputClass} style={focusRing} placeholder="0" />
              </div>
              <div className="lg:col-span-3">
                <label className={labelClass}>Descripción del servicio</label>
                <textarea name="descripcion_ser" value={form.descripcion_ser} onChange={handleChange} rows={5} maxLength={255} className={inputClass} style={focusRing} placeholder="Detalle de acciones ejecutadas..." />
                <div className="mt-1 text-right text-xs text-gray-400">
                  {form.descripcion_ser.length}/255
                </div>
              </div>
              <div className="lg:col-span-3">
                <label className={labelClass}>Elementos utilizados</label>
                <textarea
                  name="utilizados_ser"
                  value={form.utilizados_ser}
                  onChange={handleChange}
                  rows={5}
                  maxLength={255}
                  className={inputClass}
                  style={focusRing}
                  placeholder="Herramientas, materiales, equipos utilizados en el servicio..."
                />
                <div className="mt-1 text-right text-xs text-gray-400">
                  {form.utilizados_ser.length}/255
                </div>
              </div>
              <div className="lg:col-span-3">
                <label className={labelClass}>Observaciones</label>
                <textarea name="observaciones_ser" value={form.observaciones_ser} onChange={handleChange} rows={5} maxLength={255} className={inputClass} style={focusRing} placeholder="Notas adicionales..." />
                <div className="mt-1 text-right text-xs text-gray-400">
                  {form.observaciones_ser.length}/255
                </div>
              </div>
              </div>
            </div>

            <div className="rounded-xl border border-violet-200 bg-white p-6 shadow-sm">
              <p className={labelClass}>¿Software instalado por la DGDITI?</p>
              <YesNoCards value={form.licenciamiento_ser} onChange={setLicenciamiento} yesLabel="Sí, aplica" noLabel="N/A" />

              {form.licenciamiento_ser === '1' && (
                <div className="mt-5 space-y-4 border-t border-violet-100 pt-5">
                  <p className="text-sm font-medium text-gray-600">Indica qué software original se verificó o instaló:</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                        form.winoriginal_ser === '1' ? 'border-[#6b46c1] bg-violet-50 shadow-sm' : 'border-gray-200 hover:border-violet-200'
                      }`}
                    >
                      <input type="checkbox" name="winoriginal_ser" checked={form.winoriginal_ser === '1'} onChange={handleChange} className="rounded" />
                      <div>
                        <span className="block text-sm font-bold text-gray-800">Windows</span>
                        <span className="text-xs text-gray-500">Sistema operativo con licencia genuina</span>
                      </div>
                    </label>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                        form.ofioriginal_ser === '1' ? 'border-[#6b46c1] bg-violet-50 shadow-sm' : 'border-gray-200 hover:border-violet-200'
                      }`}
                    >
                      <input type="checkbox" name="ofioriginal_ser" checked={form.ofioriginal_ser === '1'} onChange={handleChange} className="rounded" />
                      <div>
                        <span className="block text-sm font-bold text-gray-800">Office</span>
                        <span className="text-xs text-gray-500">Suite Microsoft Office con licencia válida</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'refacciones':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-3 border-l-4 border-amber-500 bg-amber-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
                  <FiPackage size={22} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Materiales utilizados</p>
                  <p className="mt-1 text-sm text-gray-600">Selecciona las refacciones del catálogo y registra la cantidad aplicada.</p>
                </div>
              </div>
            </div>

            {refaccionItems.length === 0 && (
              <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
                Sin refacciones registradas. Agrega una si el servicio lo requiere.
              </p>
            )}

            <div className="space-y-3">
              {refaccionItems.map((item, idx) => (
                <div key={`ref-${idx}`} className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_140px_auto] lg:items-end">
                  <div>
                    <label className={labelClass}>Refacción</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={refaccionLabels[item.refaccion_id] || ''}
                        readOnly
                        placeholder="Seleccionar refacción..."
                        className={`${inputClass} ${refaccionLabels[item.refaccion_id] ? 'bg-green-50 border-green-200' : 'bg-gray-50'} pr-12 transition-colors`}
                      />
                      <button
                        type="button"
                        onClick={() => setModals((m) => ({ ...m, refaccion: idx }))}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-all ${
                          refaccionLabels[item.refaccion_id]
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <FiSearch size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => {
                        const next = [...refaccionItems];
                        next[idx] = { ...next[idx], cantidad: Math.max(1, Number(e.target.value) || 1) };
                        setRefaccionItems(next);
                      }}
                      className={inputClass}
                      style={focusRing}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRefaccionItems((items) => items.filter((_, i) => i !== idx));
                      setRefaccionLabels((labels) => {
                        const newLabels = { ...labels };
                        delete newLabels[item.refaccion_id];
                        return newLabels;
                      });
                    }}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiTrash2 size={16} />
                    Quitar
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setRefaccionItems((items) => [...items, { refaccion_id: '', cantidad: 1 }])}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-amber-300 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              <FiPlus size={16} />
              Agregar refacción
            </button>

            {typeof modals.refaccion === 'number' && (
              <SearchModal
                isOpen={modals.refaccion !== false}
                onClose={() => closeModal('refaccion')}
                title="Buscar refacción"
                searchFunction={refaccionesService.filtrado}
                onSelect={handleRefaccionSelectChange(modals.refaccion)}
                labelField="descripcion"
              />
            )}
          </div>
        );

      case 'evaluacion':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-3 border-l-4 border-emerald-600 bg-emerald-50 px-5 py-4">
              <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-700" size={18} />
              <div>
                <p className="text-sm font-bold text-gray-800">Valoración del servicio</p>
                <p className="mt-1 text-sm text-gray-600">¿Cómo calificarías la atención recibida? Selecciona una opción.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {EVALUACION_OPTIONS.map((opt) => {
                const selected = String(form.evaluacion_ser) === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, evaluacion_ser: opt.value }))}
                    className={`group flex min-h-[148px] flex-col items-center justify-center rounded-xl border-2 p-5 transition-all duration-200 ${
                      selected
                        ? `${opt.border} ${opt.bg} scale-[1.03] shadow-lg`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <span className={`text-4xl transition-transform duration-200 ${selected ? 'scale-110' : 'group-hover:scale-105'}`}>
                      {opt.emoji}
                    </span>
                    <span className="mt-3 text-sm font-bold uppercase tracking-wide" style={{ color: selected ? opt.color : '#6b7280' }}>
                      {opt.label}
                    </span>
                    <span className="mt-1 text-center text-xs text-gray-400">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-sm text-gray-500">
              {Number(form.evaluacion_ser) > 0
                ? `Seleccionado: ${evaluacionLabel(form.evaluacion_ser)}`
                : 'Toca una carita para calificar'}
            </p>
          </div>
        );

      case 'cerrar':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-3 border-l-4 border-[#BC955B] bg-[#DAC19A]/20 px-5 py-4">
              <FiCheckCircle className="mt-0.5 shrink-0 text-[#8A2036]" size={18} />
              <div>
                <p className="text-sm font-bold text-gray-800">Revisión final</p>
                <p className="mt-1 text-sm text-gray-600">Verifica la información antes de guardar y cambiar el estado de la solicitud.</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4">
                <p className="text-sm font-bold uppercase tracking-wide text-gray-700">Resumen de la solicitud #{id}</p>
              </div>
              <dl className="divide-y divide-gray-100">
                {[
                  ['Descripción', form.descripcion || '—'],
                  ['Diagnóstico', form.descripcion_diag || '—'],
                  ['Servicio', form.descripcion_ser || '—'],
                  ['Licenciamiento', form.licenciamiento_ser === '1' ? `Sí — Win: ${form.winoriginal_ser === '1' ? '✓' : '—'}, Office: ${form.ofioriginal_ser === '1' ? '✓' : '—'}` : 'N/A'],
                  ['Refacciones', refaccionItems.length ? `${refaccionItems.length} registrada(s)` : 'Ninguna'],
                  ['Cantidad servicio', form.cantidad_ser || '—'],
                  ['Evaluación', Number(form.evaluacion_ser) > 0 ? evaluacionLabel(form.evaluacion_ser) : '—'],
                ].map(([key, val]) => (
                  <div key={key} className="grid grid-cols-1 gap-1 px-5 py-3 text-sm sm:grid-cols-3 sm:gap-2">
                    <dt className="font-medium text-gray-500">{key}</dt>
                    <dd className="text-gray-800 sm:col-span-2">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, estatus: '1' }))}
                className={`rounded-2xl border-2 p-5 text-left transition-all ${form.estatus === '1' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 bg-white hover:border-emerald-300'}`}
              >
                <span className="block text-lg font-bold text-emerald-700">Mantener abierta</span>
                <span className="text-sm text-gray-500">Seguirá activa para seguimiento.</span>
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, estatus: '0' }))}
                className={`rounded-2xl border-2 p-5 text-left transition-all ${form.estatus === '0' ? 'border-[#BC955B] bg-[#DAC19A]/25 shadow-md' : 'border-gray-200 bg-white hover:border-[#BC955B]'}`}
              >
                <span className="block text-lg font-bold text-[#8A2036]">Cerrar solicitud</span>
                <span className="text-sm text-gray-500">Marcar como finalizada.</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!selected && loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-colorPrimario border-t-transparent" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 animate-[fadeIn_0.2s_ease-out] rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-xl ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-400">
          <span>Atender solicitud #{id}</span>
          {/* <span>{Math.round(progressPct)}% completado</span> */}
        </div>
        {/* <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%`, backgroundColor: step.color }}
          />
        </div> */}
      </div>

      <div className="mb-8 hidden lg:block">
        <div className="grid grid-cols-3 gap-2 xl:grid-cols-6">
          {STEPS.map((s, idx) => {
            const isActive = idx === currentStep;
            const isDone = savedSteps.has(s.id);
            return (
              <div key={s.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => goToStep(idx)}
                  className={`group relative flex min-h-[76px] w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-300 ${
                    isActive 
                      ? 'bg-white shadow-lg ring-2 ring-offset-2' 
                      : isDone 
                        ? 'bg-white/80 shadow-md hover:bg-white hover:shadow-lg' 
                        : 'bg-white/40 hover:bg-white/60'
                  }`}
                  style={isActive ? { ringColor: s.color } : {}}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'text-white shadow-md' 
                      : isDone 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                  }`} style={isActive ? { backgroundColor: s.color } : {}}>
                    {isDone ? <FiCheckCircle size={16} /> : idx + 1}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className={`truncate text-xs font-semibold uppercase tracking-wide ${
                      isActive 
                        ? 'text-gray-800' 
                        : isDone 
                          ? 'text-gray-700' 
                          : 'text-gray-400'
                    }`}>
                      {s.label}
                    </span>
                    <span className={`text-[10px] font-medium ${
                      isActive 
                        ? 'text-colorPrimario' 
                        : isDone 
                          ? 'text-green-600' 
                          : 'text-gray-400'
                    }`}>
                      {isDone ? 'Completado' : isActive ? 'En progreso' : 'Pendiente'}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden">
        {STEPS.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goToStep(idx)}
            className={`min-w-0 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              idx === currentStep ? 'text-white shadow-md' : savedSteps.has(s.id) ? 'bg-colorPrimario/20 text-colorPrimario' : 'bg-gray-100 text-gray-400'
            }`}
            style={idx === currentStep ? { backgroundColor: s.color } : {}}
          >
            <span className="truncate">{savedSteps.has(s.id) ? '✓ ' : ''}{idx + 1}. {s.label}</span>
          </button>
        ))}
      </div>

      <div className={`overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br ${step.bg} shadow-xl`}>
        <div className="flex items-center gap-4 border-b border-white/50 bg-white/40 px-6 py-5 backdrop-blur-sm md:px-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: step.color }}>
            {step.emoji ? <span className="text-2xl">{step.emoji}</span> : <step.icon size={26} />}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Etapa {currentStep + 1} de {STEPS.length}
              {savedSteps.has(step.id) && <span className="ml-2 text-emerald-600">· Guardada</span>}
            </p>
            <h2 className="text-2xl font-extrabold text-gray-800">{step.label}</h2>
          </div>
        </div>

        <div
          key={`${step.id}-${animKey}`}
          className="animate-[fadeIn_0.25s_ease-out] bg-white/70 p-6 backdrop-blur-sm md:p-8"
        >
          {renderStepContent()}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/50 bg-white/50 px-6 py-4 backdrop-blur-sm md:px-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => navigate('/solicitudes')} className="w-full rounded-xl border border-[#BC955B]/60 px-5 py-2.5 text-sm font-semibold text-[#8A2036] transition hover:bg-[#DAC19A]/25 sm:w-auto">
              Cancelar
            </button>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => saveCurrentStep({ advance: true })}
                  disabled={isBusy}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
                  style={{ backgroundColor: step.color }}
                >
                  Guardar y continuar
                  <FiChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => saveCurrentStep({ finalize: true })}
                  disabled={isBusy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-colorPrimario px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
                >
                  <FiCheckCircle size={18} />
                  {savingStep ? 'Finalizando...' : 'Guardar y salir'}
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudEdit;
