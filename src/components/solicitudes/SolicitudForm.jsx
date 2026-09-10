import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSolicitud, clearError } from '../../features/solicitudes/solicitudesSlice';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../common/CustomSelect';
import SearchModal from '../common/SearchModal';
import Swal from 'sweetalert2';
import serviciosService from '../../services/serviciosService';
import adscripcionesService from '../../services/adscripcionesService';
import empleadosService from '../../services/empleadosService';
import equiposService from '../../services/equiposService';
import { FiClipboard, FiSave, FiArrowLeft, FiCalendar, FiUser, FiMonitor, FiCheckCircle, FiAlertCircle, FiSearch, FiLoader } from 'react-icons/fi';
import { buildSolicitudPayload, inputClass, labelClass } from './solicitudFormUtils';

const SolicitudForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.solicitudes);

  const [form, setForm] = useState({
    servicio_id: '',
    adscripcion_id: '',
    empleado_id: '',
    equipo_id: '',
    descripcion: '',
    fecha: new Date().toISOString().slice(0, 10),
    hora: new Date().toTimeString().slice(0, 5),
    indicador_equipo: '0',
    estatus: '1',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Estado para modales de búsqueda
  const [modals, setModals] = useState({
    servicio: false,
    adscripcion: false,
    empleado: false,
    equipo: false,
  });

  // Mantener labels seleccionados
  const [selectedLabels, setSelectedLabels] = useState({
    servicio_id: '',
    adscripcion_id: '',
    empleado_id: '',
    equipo_id: '',
  });

  const openModal = (modalName) => setModals((m) => ({ ...m, [modalName]: true }));
  const closeModal = (modalName) => setModals((m) => ({ ...m, [modalName]: false }));

  const setIndicadorEquipo = (val) => {
    setForm((f) => ({
      ...f,
      indicador_equipo: val,
      equipo_id: val === '1' ? f.equipo_id : '',
    }));
  };
  const handleSelectChange = (name) => (option) => {
    setForm((f) => ({ ...f, [name]: option?.value ?? '' }));
    setSelectedLabels((s) => ({ ...s, [name]: option?.label || '' }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const numericFields = ['servicio_id', 'adscripcion_id', 'empleado_id', 'equipo_id', 'fecha', 'hora'];
    const processedValue = type === 'checkbox' 
      ? (checked ? '1' : '0') 
      : numericFields.includes(name) 
        ? value 
        : value.toUpperCase();
    setForm((f) => ({ ...f, [name]: processedValue }));
    if (touched[name]) {
      validateField(name, processedValue);
    }
  };

  const handleBlur = (name) => (e) => {
    setTouched((t) => ({ ...t, [name]: true }));
    const { value, type, checked } = e.target;
    validateField(name, type === 'checkbox' ? (checked ? '1' : '0') : value);
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'descripcion' && !value.trim()) {
      error = 'La descripción es obligatoria';
    }
    if (name === 'servicio_id' && !value) {
      error = 'Selecciona un tipo de servicio';
    }
    if (name === 'adscripcion_id' && !value) {
      error = 'Selecciona una adscripción';
    }
    if (name === 'empleado_id' && !value) {
      error = 'Selecciona un empleado';
    }
    if (name === 'equipo_id' && form.indicador_equipo === '1' && !value) {
      error = 'Selecciona un equipo';
    }
    setErrors((e) => ({ ...e, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const fieldsToValidate = ['descripcion', 'servicio_id', 'adscripcion_id', 'empleado_id'];
    if (form.indicador_equipo === '1') {
      fieldsToValidate.push('equipo_id');
    }
    let isValid = true;
    fieldsToValidate.forEach((field) => {
      if (!validateField(field, form[field])) {
        isValid = false;
      }
    });
    setTouched(fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire('Campos requeridos', 'Por favor completa todos los campos obligatorios.', 'warning');
      return;
    }
    try {
      const fields = ['servicio_id', 'adscripcion_id', 'empleado_id', 'equipo_id', 'descripcion', 'fecha', 'hora', 'indicador_equipo', 'estatus'];
      const payload = buildSolicitudPayload(form, fields);
      await dispatch(createSolicitud(payload)).unwrap();
      Swal.fire({ title: 'Solicitud registrada', text: 'Podrás completar diagnóstico y servicio desde Atender.', icon: 'success', timer: 2000, showConfirmButton: false });
      navigate('/solicitudes');
    } catch (err) {
      Swal.fire('Error', err || 'No se pudo crear', 'error');
      dispatch(clearError());
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-3xl border border-[#8A2036]/10 bg-gradient-to-br from-[#8A2036]/5 to-[#BC955B]/5 shadow-xl">
          <div className="flex flex-col gap-4 border-b border-white/60 bg-white/50 px-6 py-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-colorPrimario text-white shadow-lg">
                <FiClipboard size={26} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Nueva solicitud</p>
                <h2 className="text-2xl font-extrabold text-gray-800">Registrar solicitud de servicio</h2>
              </div>
            </div>
            {/* <div className="rounded-2xl border border-colorPrimario/15 bg-colorPrimario/5 px-4 py-2.5 text-sm text-colorPrimario">
              El diagnóstico y cierre se capturan después en <strong>Atender</strong>.
            </div> */}
          </div>

          <div className="grid grid-cols-1 gap-6 bg-white/80 p-6 backdrop-blur-sm lg:grid-cols-12 lg:gap-8 lg:p-8">
            {/* Datos del solicitante - ocupa todo el ancho */}
            <div className="lg:col-span-12">
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
                    {touched.servicio_id && errors.servicio_id && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
                        <FiAlertCircle size={14} />
                        {errors.servicio_id}
                      </p>
                    )}
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
                    {touched.adscripcion_id && errors.adscripcion_id && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
                        <FiAlertCircle size={14} />
                        {errors.adscripcion_id}
                      </p>
                    )}
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
                    {touched.empleado_id && errors.empleado_id && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
                        <FiAlertCircle size={14} />
                        {errors.empleado_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SOLICITUD: */}
            <div className="lg:col-span-12">
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
                  onBlur={handleBlur('descripcion')}
                  required
                  rows={3}
                  maxLength={250}
                  className={`${inputClass} ${touched.descripcion && errors.descripcion ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                  placeholder="Ej: Equipo no enciende, solicitud de instalación de software, reubicación de nodos de red..."
                />
                {touched.descripcion && errors.descripcion && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                    <FiAlertCircle size={14} />
                    {errors.descripcion}
                  </p>
                )}
              </div>
            </div>

            {/* Fecha y hora + Equipo físico en la misma fila */}
            <div className="grid grid-cols-1 gap-6 lg:col-span-12 lg:grid-cols-2">
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
                      max={new Date().toISOString().slice(0, 10)}
                      required 
                      className={`${inputClass} focus:ring-colorPrimario/20 focus:border-colorPrimario/30`} 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Hora *</label>
                    <input 
                      type="time" 
                      name="hora" 
                      value={form.hora} 
                      onChange={handleChange} 
                      required 
                      className={`${inputClass} focus:ring-colorPrimario/20 focus:border-colorPrimario/30`} 
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-colorPrimario">
                  <FiMonitor size={18} />
                  <span className="text-sm font-bold uppercase tracking-wide">Equipo</span>
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
                      onClick={() => setIndicadorEquipo(val)}
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
                        onBlur={() => setTouched((t) => ({ ...t, equipo_id: true }))}
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
                    {touched.equipo_id && errors.equipo_id && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
                        <FiAlertCircle size={14} />
                        {errors.equipo_id}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/60 bg-white/60 px-6 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between md:px-8">
            <button
              type="button"
              onClick={() => navigate('/solicitudes')}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
            >
              <FiArrowLeft size={16} />
              Volver al listado
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-colorPrimario px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-colorPrimario/25 transition-all duration-200 hover:bg-colorPrimario/90 hover:shadow-xl hover:shadow-colorPrimario/30 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-colorPrimario/50 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <FiLoader size={18} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <FiSave size={18} className="group-hover:scale-110 transition-transform" />
                  Registrar solicitud
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Modales de búsqueda */}
      <SearchModal
        isOpen={modals.servicio}
        onClose={() => closeModal('servicio')}
        title="Buscar Servicio"
        searchFunction={serviciosService.filtrado}
        onSelect={(option) => {
          setForm((f) => ({ ...f, servicio_id: option.value }));
          setSelectedLabels((s) => ({ ...s, servicio_id: option.label }));
          setTouched((t) => ({ ...t, servicio_id: true }));
        }}
        labelField="descripcion"
      />

      <SearchModal
        isOpen={modals.adscripcion}
        onClose={() => closeModal('adscripcion')}
        title="Buscar Adscripción"
        searchFunction={adscripcionesService.filtrado}
        onSelect={(option) => {
          setForm((f) => ({ ...f, adscripcion_id: option.value }));
          setSelectedLabels((s) => ({ ...s, adscripcion_id: option.label }));
          setTouched((t) => ({ ...t, adscripcion_id: true }));
        }}
        labelFormatter={(item) => `${item.codigo || ''} — ${item.descripcion || ''}`.trim()}
      />

      <SearchModal
        isOpen={modals.empleado}
        onClose={() => closeModal('empleado')}
        title="Buscar Empleado"
        searchFunction={empleadosService.filtrado}
        onSelect={(option) => {
          setForm((f) => ({ ...f, empleado_id: option.value }));
          setSelectedLabels((s) => ({ ...s, empleado_id: option.label }));
          setTouched((t) => ({ ...t, empleado_id: true }));
        }}
        labelFormatter={(item) => `${item.nombre || ''} ${item.apellidos || ''}`.trim()}
      />

      <SearchModal
        isOpen={modals.equipo}
        onClose={() => closeModal('equipo')}
        title="Buscar Equipo"
        searchFunction={equiposService.filtrado}
        onSelect={(option) => {
          setForm((f) => ({ ...f, equipo_id: option.value }));
          setSelectedLabels((s) => ({ ...s, equipo_id: option.label }));
          setTouched((t) => ({ ...t, equipo_id: true }));
        }}
        labelFormatter={(item) => `${item.inventario || item.id} — ${item.marca || ''} ${item.modelo || ''}`.trim()}
      />
    </div>
  );
};

export default SolicitudForm;
