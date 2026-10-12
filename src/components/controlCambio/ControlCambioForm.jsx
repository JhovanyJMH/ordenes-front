import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import {
  FiDownload,
  FiClipboard,
  FiLayers,
  FiAlertTriangle,
  FiActivity,
  FiSearch,
  FiCheckCircle,
  FiArrowLeft,
  FiEye,
  FiLock,
  FiUnlock,
  FiAlertCircle,
  FiCalendar,
  FiUser,
  FiServer,
  FiChevronRight,
  FiFileText,
  FiCamera,
  FiX,
  FiCode,
  FiDatabase,
  FiSettings,
} from 'react-icons/fi';
import controlCambioService, { getDocumentoFilename } from '../../services/controlCambioService';
import empleadosService from '../../services/empleadosService';
import usersService from '../../services/usersService';
import sistemasService from '../../services/sistemasService';
import SearchModal from '../common/SearchModal';

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  fecha_solicitud: today(),
  respaldo_oficio: false,
  respaldo_correo: false,
  respaldo_minuta: false,
  respaldo_pruebas: false,
  sistema_id: '',
  nombre_sistema: '',
  descripcion_solicitud: '',
  modulo_funcionalidad: '',
  usuarios_afectados: '',
  justificacion: '',
  area_solicitante: '',
  solicitante_id: '',
  solicitante_nombre: '',
  numero_control: '',
  ambiente_pruebas: false,
  ambiente_productivo: false,
  impacto: '',
  prioridad: '',
  tipo_cambio: '',
  clasificacion_frontend: false,
  clasificacion_backend: false,
  clasificacion_bd: false,
  clasificacion_infraestructura: false,
  fecha_analisis: '',
  elementos_afectados: '',
  cambios_menores: false,
  cambios_mayores: false,
  descripcion_impacto: '',
  alcance: '',
  fecha_desarrollo: '',
  responsable_desarrollo_id: '',
  responsable_desarrollo: '',
  solucion: '',
  revisiones: '',
  fecha_pruebas: '',
  responsable_pruebas_id: '',
  responsable_pruebas: '',
  observaciones_pruebas: '',
  fecha_autorizacion: '',
  responsable_autorizacion_id: '',
  responsable_autorizacion: '',
  observaciones_autorizacion: '',
  fecha_produccion: '',
  responsable_produccion_id: '',
  responsable_produccion: '',
  resultado_implementacion: '',
  observaciones_produccion: '',
  firmante_area_solicitante_id: '',
  firmante_area_solicitante: '',
  cargo_area_solicitante: 'Subdirector de Bienestar y Recreación Juvenil',
  firmante_desarrollo_id: '',
  firmante_desarrollo: '',
  cargo_desarrollo: 'Subdirectora de Desarrollo de Software y Bases de Datos',
  firmante_director_id: '',
  firmante_director: '',
  cargo_director: 'Director de la Dirección General de Desarrollo Institucional y Tecnologías de la Información',
  estatus: 1,
};

const STEPS = [
  { id: 'solicitud', label: 'Solicitud', description: 'Datos generales, sistema y documentación de respaldo.', icon: FiClipboard, color: '#8A2036', bg: 'from-[#8A2036]/10 to-[#BC955B]/5' },
  { id: 'cambio', label: 'Cambio requerido', description: 'Clasifica el cambio, su prioridad y los ambientes involucrados.', icon: FiLayers, color: '#1f7a8c', bg: 'from-[#1f7a8c]/10 to-teal-50' },
  { id: 'impacto', label: 'Análisis de impacto', description: 'Registra el alcance y los elementos que podrían verse afectados.', icon: FiAlertTriangle, color: '#d97706', bg: 'from-amber-100/80 to-orange-50' },
  { id: 'historial', label: 'Implementación', description: 'Documenta desarrollo, pruebas, autorización, producción y firmas.', icon: FiActivity, color: '#0f766e', bg: 'from-emerald-100/80 to-teal-50' },
  { id: 'generar', label: 'Revisión', description: 'Confirma el resumen y guarda el control de cambios.', icon: FiDownload, color: '#8A2036', bg: 'from-[#8A2036]/10 to-[#BC955B]/5' },
];

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm transition-all focus:border-[#8A2036] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/20';
const labelClass = 'mb-2 block text-sm font-semibold tracking-tight text-gray-800';

const FieldLabel = ({ children, required, htmlFor }) => (
  <label htmlFor={htmlFor} className={labelClass}>
    {children}
    {required ? <span className="ml-1 text-[#8A2036]">*</span> : null}
  </label>
);

const SearchPicker = ({ label, required, value, filled, placeholder, onOpen, hint }) => {
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

const ChoiceButton = ({ selected, onClick, title, description, accent = '#8A2036' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`relative w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
      selected
        ? 'bg-white shadow-md ring-2 ring-offset-1'
        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
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

const SectionCard = ({ icon: Icon, title, children, accent = '#8A2036' }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    {title ? (
      <div className="mb-4 flex items-center gap-2" style={{ color: accent }}>
        {Icon ? <Icon size={18} /> : null}
        <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
      </div>
    ) : null}
    {children}
  </div>
);

const employeeName = (emp) => {
  if (!emp) return '';
  if (typeof emp === 'string') return emp;
  if (emp.nombre_completo) return emp.nombre_completo;
  if (emp.name) return [emp.name, emp.ap_paterno, emp.ap_materno].filter(Boolean).join(' ');
  return `${emp.nombre || ''} ${emp.apellidos || ''}`.trim();
};

const formatDate = (dateValue) => {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  } catch {
    return '';
  }
};

const preparePdfDocument = async (file) => {
  if (!file) return null;
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return file;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Selecciona un PDF o una imagen JPEG, PNG o WEBP para convertirla a PDF.');
  }

  const imageData = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
    reader.readAsDataURL(file);
  });
  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('La imagen seleccionada no es válida.'));
    element.src = imageData;
  });
  const pdf = new jsPDF({
    orientation: image.width > image.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const scale = Math.min(pageWidth / image.width, pageHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const format = file.type === 'image/png' ? 'PNG' : file.type === 'image/webp' ? 'WEBP' : 'JPEG';
  pdf.addImage(imageData, format, (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'documento';
  return new File([pdf.output('blob')], `${baseName}.pdf`, { type: 'application/pdf' });
};

const ControlCambioForm = ({ mode = 'create', editId = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef(null);
  const submitLockRef = useRef(false);
  const recordIdRef = useRef(mode === 'edit' ? editId : null);
  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [documentoPdf, setDocumentoPdf] = useState(null);
  const [documentoPreview, setDocumentoPreview] = useState(null);
  const [loadingDocumentoPreview, setLoadingDocumentoPreview] = useState(false);
  const [modals, setModals] = useState({
    sistema: false,
    solicitante: false,
    responsable_desarrollo: false,
    responsable_pruebas: false,
    responsable_autorizacion: false,
    responsable_produccion: false,
    firmante_area_solicitante: false,
    firmante_desarrollo: false,
    firmante_director: false,
  });

  useEffect(() => {
    if (mode === 'edit' && editId) loadRecord(editId);
  }, [mode, editId]);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;
    const setPreviewFromBlob = (blob) => {
      objectUrl = URL.createObjectURL(blob);
      setDocumentoPreview({
        url: objectUrl,
        type: blob.type.startsWith('image/') ? blob.type : 'application/pdf',
      });
    };

    if (documentoPdf) {
      setPreviewFromBlob(documentoPdf);
      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }

    setDocumentoPreview(null);
    if (mode !== 'edit' || !editId || !formData.tiene_documento_pdf) {
      setLoadingDocumentoPreview(false);
      return undefined;
    }

    setLoadingDocumentoPreview(true);
    controlCambioService.downloadDocumento(editId)
      .then((blob) => {
        if (!cancelled) setPreviewFromBlob(blob);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la vista previa del PDF adjunto.' });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDocumentoPreview(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentoPdf, editId, formData.tiene_documento_pdf, mode]);

  const loadRecord = async (id) => {
    try {
      setLoading(true);
      const response = await controlCambioService.getById(id);
      const data = response?.data || response;
      setFormData({
        ...initialForm,
        ...data,
        fecha_solicitud: formatDate(data.fecha_solicitud) || initialForm.fecha_solicitud,
        fecha_analisis: formatDate(data.fecha_analisis),
        fecha_desarrollo: formatDate(data.fecha_desarrollo),
        fecha_pruebas: formatDate(data.fecha_pruebas),
        fecha_autorizacion: formatDate(data.fecha_autorizacion),
        fecha_produccion: formatDate(data.fecha_produccion),
        sistema_id: data.sistema_id || data.sistema?.id || '',
        solicitante_nombre: employeeName(data.solicitante_nombre || data.solicitante),
        responsable_desarrollo: employeeName(data.responsable_desarrollo),
        responsable_pruebas: employeeName(data.responsable_pruebas),
        responsable_autorizacion: employeeName(data.responsable_autorizacion),
        responsable_produccion: employeeName(data.responsable_produccion),
        firmante_area_solicitante: employeeName(data.empleado_firmante_area_solicitante) || data.firmante_area_solicitante || '',
        firmante_desarrollo: employeeName(data.empleado_firmante_desarrollo) || data.firmante_desarrollo || '',
        firmante_director: employeeName(data.empleado_firmante_director) || data.firmante_director || '',
        cargo_area_solicitante: data.cargo_area_solicitante || data.empleado_firmante_area_solicitante?.puesto || initialForm.cargo_area_solicitante,
        cargo_desarrollo: data.cargo_desarrollo || data.empleado_firmante_desarrollo?.puesto || initialForm.cargo_desarrollo,
        cargo_director: data.cargo_director || data.empleado_firmante_director?.puesto || initialForm.cargo_director,
        estatus: Number(data.estatus ?? 1),
      });
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el control de cambios.' });
    } finally {
      setLoading(false);
    }
  };

  const missingSolicitud = useMemo(() => {
    const missing = [];
    if (!formData.fecha_solicitud) missing.push('Fecha de solicitud');
    if (!formData.sistema_id) missing.push('Sistema del catálogo');
    if (!formData.nombre_sistema) missing.push('Nombre del sistema');
    return missing;
  }, [formData.fecha_solicitud, formData.sistema_id, formData.nombre_sistema]);

  const canGenerate = missingSolicitud.length === 0;
  const solicitudProgress = Math.round(((3 - missingSolicitud.length) / 3) * 100);

  const step = STEPS[currentStep];

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleFlag = (name) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleAlcanceChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      cambios_menores: value === 'menores',
      cambios_mayores: value === 'mayores',
    }));
  };

  const handleSistemaSelect = (option) => {
    setFormData((prev) => ({
      ...prev,
      sistema_id: option?.value || '',
      nombre_sistema: option?.nombre || option?.label || '',
      area_solicitante: prev.area_solicitante || option?.adscripcion?.nombre || option?.adscripcion_nombre || '',
    }));
  };

  const handlePersonSelect = (idKey, nameKey) => (option) => {
    setFormData((prev) => ({
      ...prev,
      [idKey]: option?.value || '',
      [nameKey]: option?.label || '',
    }));
  };

  const handleSignerSelect = (idKey, nameKey, cargoKey) => (option) => {
    setFormData((prev) => ({
      ...prev,
      [idKey]: option?.value || '',
      [nameKey]: option?.label || '',
      [cargoKey]: option?.puesto || '',
    }));
  };

  const openModal = (name) => setModals((prev) => ({ ...prev, [name]: true }));
  const closeModal = (name) => setModals((prev) => ({ ...prev, [name]: false }));

  const saveProgress = async () => {
    if (submitLockRef.current) return false;
    if (!canGenerate) {
      await Swal.fire({
        icon: 'warning',
        title: 'Completa los datos de la solicitud',
        text: 'Antes de continuar, captura la fecha de solicitud y selecciona un sistema.',
      });
      return false;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    try {
      const payload = Object.fromEntries(
        Object.keys(initialForm).map((key) => [key, formData[key]]),
      );
      payload.estatus = Number(formData.estatus ?? 1);

      let response;
      if (recordIdRef.current) {
        if (mode === 'edit' && documentoPdf) {
          const multipartPayload = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            multipartPayload.append(key, value === true ? '1' : value === false ? '0' : value ?? '');
          });
          const documento = await preparePdfDocument(documentoPdf);
          if (documento) multipartPayload.append('documento_pdf', documento);
          response = await controlCambioService.update(recordIdRef.current, multipartPayload);
        } else {
          response = await controlCambioService.update(recordIdRef.current, payload);
        }
      } else {
        response = await controlCambioService.create(payload);
        const savedId = response?.data?.id || response?.id;
        if (!savedId) throw new Error('El control se guardó, pero no se recibió su identificador.');
        recordIdRef.current = savedId;
      }

      const savedRecord = response?.data || response;
      setFormData((current) => ({
        ...current,
        numero_control: savedRecord?.numero_control || current.numero_control,
        tiene_documento_pdf: savedRecord?.tiene_documento_pdf ?? (documentoPdf ? true : current.tiene_documento_pdf),
      }));
      if (documentoPdf) {
        setDocumentoPdf(null);
        if (pdfInputRef.current) pdfInputRef.current.value = '';
        if (imageInputRef.current) imageInputRef.current.value = '';
      }
      return true;
    } catch (error) {
      console.error(error);
      const errors = error?.response?.data?.errors;
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar el paso',
        text: errors ? Object.values(errors).flat().join('\n') : error?.response?.data?.message || error.message || 'No se pudo guardar el progreso del control de cambios.',
      });
      return false;
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const goToStep = async (nextStep) => {
    if (nextStep === currentStep || submitting) return;
    if (await saveProgress()) setCurrentStep(nextStep);
  };

  const handleSubmit = async () => {
    if (!canGenerate) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Completa al menos la fecha de solicitud y el sistema.' });
      return;
    }

    if (await saveProgress()) {
      await Swal.fire({
        icon: 'success',
        title: mode === 'edit' || editId ? 'Control actualizado' : 'Control guardado',
        text: 'El control de cambios se guardó correctamente.',
        timer: 1400,
        showConfirmButton: false,
      });
      navigate('/control-cambios');
    }
  };

  const renderStepContent = () => {
    switch (step.id) {
      case 'solicitud':
        return (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard icon={FiCalendar} title="Solicitud">
                <div>
                  <FieldLabel required>Fecha de solicitud</FieldLabel>
                  <input type="date" name="fecha_solicitud" value={formData.fecha_solicitud} onChange={handleChange} className={inputClass} />
                </div>
          
              </SectionCard>

              <SectionCard icon={FiUser} title="Solicitante">
                <SearchPicker
                  label="Nombre y firma del solicitante"
                  value={formData.solicitante_nombre}
                  placeholder="Buscar empleado..."
                  onOpen={() => openModal('solicitante')}
                />
                <div className="mt-4">
                  <FieldLabel>Área solicitante</FieldLabel>
                  <input type="text" name="area_solicitante" value={formData.area_solicitante} onChange={handleChange} className={inputClass} />
                </div>
              </SectionCard>
            </div>

            <SectionCard icon={FiServer} title="Sistema">
              <div className="grid gap-4 md:grid-cols-2">
                <SearchPicker
                  label="Sistema del catálogo"
                  required
                  value={formData.nombre_sistema}
                  filled={Boolean(formData.sistema_id)}
                  placeholder="Buscar sistema..."
                  onOpen={() => openModal('sistema')}
                  hint="La selección del catálogo identifica el sistema del cambio."
                />
                <div>
                  <FieldLabel required>Nombre del sistema</FieldLabel>
                  <input type="text" name="nombre_sistema" value={formData.nombre_sistema} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <FieldLabel>Módulo / Funcionalidad</FieldLabel>
                  <input type="text" name="modulo_funcionalidad" value={formData.modulo_funcionalidad} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <FieldLabel>Usuarios afectados</FieldLabel>
                  <input type="text" name="usuarios_afectados" value={formData.usuarios_afectados} onChange={handleChange} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Descripción de la solicitud</FieldLabel>
                  <textarea name="descripcion_solicitud" value={formData.descripcion_solicitud} onChange={handleChange} rows={3} className={inputClass} placeholder="Describe el cambio solicitado." />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Justificación</FieldLabel>
                  <textarea name="justificacion" value={formData.justificacion} onChange={handleChange} rows={3} className={inputClass} placeholder="Motivo o beneficio del cambio." />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={FiFileText} title="Documento de respaldo">
              <p className="mb-3 text-xs text-gray-500">Puedes marcar uno o varios.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['respaldo_oficio', 'Oficio formal de solicitud'],
                  ['respaldo_correo', 'Correo institucional de solicitud'],
                  ['respaldo_minuta', 'Minuta de reunión autorizada'],
                  ['respaldo_pruebas', 'Evidencia de pruebas realizadas'],
                ].map(([name, title]) => (
                  <ChoiceButton key={name} selected={Boolean(formData[name])} onClick={() => toggleFlag(name)} title={title} />
                ))}
              </div>
            </SectionCard>
          </div>
        );
      case 'cambio':
        return (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <SectionCard title="Ambiente" accent="#1f7a8c">
                <div className="space-y-3">
                  <ChoiceButton
                    selected={formData.ambiente_pruebas}
                    onClick={() => toggleFlag('ambiente_pruebas')}
                    title="Ambiente de pruebas"
                    description="Validación previa"
                    accent="#1f7a8c"
                  />
                  <ChoiceButton
                    selected={formData.ambiente_productivo}
                    onClick={() => toggleFlag('ambiente_productivo')}
                    title="Ambiente productivo"
                    description="Operación en vivo"
                    accent="#0f766e"
                  />
                </div>
              </SectionCard>

              <SectionCard title="Impacto">
                <div className="space-y-3">
                  {[
                    ['Crítico', 'Afecta operación esencial', '#b91c1c'],
                    ['Moderado', 'Impacto controlado', '#b45309'],
                    ['Bajo', 'Efecto limitado', '#0369a1'],
                  ].map(([option, description, accent]) => (
                    <ChoiceButton
                      key={option}
                      selected={formData.impacto === option}
                      onClick={() => setFormData((prev) => ({ ...prev, impacto: option }))}
                      title={option}
                      description={description}
                      accent={accent}
                    />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Prioridad">
                <div className="space-y-3">
                  {[
                    ['Alta', 'Atención inmediata', '#b91c1c'],
                    ['Media', 'Programada', '#b45309'],
                    ['Baja', 'Puede esperar', '#0369a1'],
                  ].map(([option, description, accent]) => (
                    <ChoiceButton
                      key={option}
                      selected={formData.prioridad === option}
                      onClick={() => setFormData((prev) => ({ ...prev, prioridad: option }))}
                      title={option}
                      description={description}
                      accent={accent}
                    />
                  ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Tipo de cambio">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {['Correctivo', 'Preventivo', 'Evolutivo', 'Adaptativo', 'Mejora Funcional'].map((option) => (
                  <ChoiceButton
                    key={option}
                    selected={formData.tipo_cambio === option}
                    onClick={() => setFormData((prev) => ({ ...prev, tipo_cambio: option }))}
                    title={option}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Clasificación adicional">
              <p className="mb-3 text-xs text-gray-500">Marca los componentes involucrados.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['clasificacion_frontend', 'Frontend', FiCode],
                  ['clasificacion_backend', 'Backend', FiServer],
                  ['clasificacion_bd', 'Base de Datos', FiDatabase],
                  ['clasificacion_infraestructura', 'Infraestructura / Servidor', FiSettings],
                ].map(([name, title, Icon]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleFlag(name)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                      formData[name]
                        ? 'border-[#1f7a8c] bg-white shadow-md'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${formData[name] ? 'bg-[#1f7a8c]/10 text-[#1f7a8c]' : 'bg-gray-100 text-gray-400'}`}>
                      <Icon size={18} />
                    </span>
                    <span className="font-bold text-gray-800">{title}</span>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        );
      case 'impacto':
        return (
          <div className="space-y-6">
            <SectionCard icon={FiAlertTriangle} title="Análisis" accent="#d97706">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Fecha de análisis</FieldLabel>
                  <input type="date" name="fecha_analisis" value={formData.fecha_analisis} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <FieldLabel>Elementos afectados</FieldLabel>
                  <input type="text" name="elementos_afectados" value={formData.elementos_afectados} onChange={handleChange} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Alcance del cambio</FieldLabel>
                  <div className="grid gap-3 md:grid-cols-2">
                    <ChoiceButton
                      selected={formData.cambios_menores}
                      onClick={() => handleAlcanceChange('menores')}
                      title="Cambios menores"
                      description="Ajustes de bajo riesgo"
                      accent="#0369a1"
                    />
                    <ChoiceButton
                      selected={formData.cambios_mayores}
                      onClick={() => handleAlcanceChange('mayores')}
                      title="Cambios mayores"
                      description="Requiere mayor control"
                      accent="#b91c1c"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Descripción</FieldLabel>
                  <textarea name="descripcion_impacto" value={formData.descripcion_impacto} onChange={handleChange} rows={3} className={inputClass} placeholder="Describe el impacto esperado." />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Alcance</FieldLabel>
                  <textarea name="alcance" value={formData.alcance} onChange={handleChange} rows={3} className={inputClass} placeholder="Límites y cobertura del cambio." />
                </div>
              </div>
            </SectionCard>
          </div>
        );
      case 'historial':
        return (
          <div className="space-y-6">
            <SectionCard icon={FiCode} title="Desarrollo" accent="#0f766e">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Fecha</FieldLabel>
                  <input type="date" name="fecha_desarrollo" value={formData.fecha_desarrollo} onChange={handleChange} className={inputClass} />
                </div>
                <SearchPicker
                  label="Responsable de realizar cambios"
                  value={formData.responsable_desarrollo}
                  placeholder="Buscar usuario..."
                  onOpen={() => openModal('responsable_desarrollo')}
                />
                <div className="md:col-span-2">
                  <FieldLabel>Solución</FieldLabel>
                  <textarea name="solucion" value={formData.solucion} onChange={handleChange} rows={2} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Revisiones</FieldLabel>
                  <textarea name="revisiones" value={formData.revisiones} onChange={handleChange} rows={2} className={inputClass} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={FiCheckCircle} title="Pruebas" accent="#0f766e">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Fecha</FieldLabel>
                  <input type="date" name="fecha_pruebas" value={formData.fecha_pruebas} onChange={handleChange} className={inputClass} />
                </div>
                <SearchPicker
                  label="Responsable de las pruebas"
                  value={formData.responsable_pruebas}
                  placeholder="Buscar usuario..."
                  onOpen={() => openModal('responsable_pruebas')}
                />
                <div className="md:col-span-2">
                  <FieldLabel>Observaciones</FieldLabel>
                  <textarea name="observaciones_pruebas" value={formData.observaciones_pruebas} onChange={handleChange} rows={2} className={inputClass} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={FiLock} title="Autorización para producción" accent="#0f766e">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Fecha</FieldLabel>
                  <input type="date" name="fecha_autorizacion" value={formData.fecha_autorizacion} onChange={handleChange} className={inputClass} />
                </div>
                <SearchPicker
                  label="Responsable"
                  value={formData.responsable_autorizacion}
                  placeholder="Buscar usuario..."
                  onOpen={() => openModal('responsable_autorizacion')}
                />
                <div className="md:col-span-2">
                  <FieldLabel>Observaciones</FieldLabel>
                  <textarea name="observaciones_autorizacion" value={formData.observaciones_autorizacion} onChange={handleChange} rows={2} className={inputClass} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={FiServer} title="Ambiente productivo" accent="#0f766e">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Fecha</FieldLabel>
                  <input type="date" name="fecha_produccion" value={formData.fecha_produccion} onChange={handleChange} className={inputClass} />
                </div>
                <SearchPicker
                  label="Responsable"
                  value={formData.responsable_produccion}
                  placeholder="Buscar usuario..."
                  onOpen={() => openModal('responsable_produccion')}
                />
                <div className="md:col-span-2">
                  <FieldLabel>Resultado de implementación</FieldLabel>
                  <textarea name="resultado_implementacion" value={formData.resultado_implementacion} onChange={handleChange} rows={2} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Observaciones</FieldLabel>
                  <textarea name="observaciones_produccion" value={formData.observaciones_produccion} onChange={handleChange} rows={2} className={inputClass} />
                </div>
              </div>
            </SectionCard>

            <div className="grid gap-5 md:grid-cols-2">
              {[
                ['Área solicitante', 'firmante_area_solicitante', 'cargo_area_solicitante'],
                ['Responsable de desarrollo', 'firmante_desarrollo', 'cargo_desarrollo'],
              ].map(([title, field, cargoField]) => (
                <div key={field} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-[#BC955B]">
                    <FiUser size={18} />
                    <span className="text-sm font-bold uppercase tracking-wide text-[#8A2036]">{title}</span>
                  </div>
                  <SearchPicker
                    value={formData[field]}
                    placeholder="Buscar empleado..."
                    onOpen={() => openModal(field)}
                  />
                  <div className="mt-4">
                    <FieldLabel htmlFor={cargoField}>Cargo para el PDF</FieldLabel>
                    <input id={cargoField} type="text" name={cargoField} value={formData[cargoField]} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:col-span-2">
                <div className="mb-4 flex items-center gap-2 text-[#BC955B]">
                  <FiUser size={18} />
                  <span className="text-sm font-bold uppercase tracking-wide text-[#8A2036]">Director DGDITI</span>
                </div>
                <SearchPicker
                  value={formData.firmante_director}
                  placeholder="Buscar empleado..."
                  onOpen={() => openModal('firmante_director')}
                />
                <div className="mt-4">
                  <FieldLabel htmlFor="cargo_director">Cargo para el PDF</FieldLabel>
                  <input id="cargo_director" type="text" name="cargo_director" value={formData.cargo_director} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'generar':
        return (
          <div className="space-y-6">
            {!canGenerate ? (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="font-semibold">Faltan datos de la solicitud</p>
                  <p className="mt-1 text-amber-800">{missingSolicitud.join(' · ')}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <FiCheckCircle className="mt-0.5 shrink-0" size={18} />
                <p>Los datos mínimos de la solicitud están completos. Revisa el resumen antes de guardar.</p>
              </div>
            )}

            {mode === 'edit' && (
              <>
                <SectionCard title="Estado del control de cambios">
                  <p className="mb-3 text-sm text-gray-600">Define si el registro quedará abierto o cerrado al actualizar.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { value: 1, label: 'Abierto', description: 'El control podrá seguir actualizándose.', icon: FiUnlock, selected: 'border-emerald-600 bg-emerald-50 text-emerald-800' },
                      { value: 0, label: 'Cerrado', description: 'El control quedará marcado como cerrado.', icon: FiLock, selected: 'border-stone-500 bg-stone-100 text-stone-800' },
                    ].map(({ value, label, description, icon: Icon, selected }) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={Number(formData.estatus) === value}
                        onClick={() => setFormData((prev) => ({ ...prev, estatus: value }))}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                          Number(formData.estatus) === value ? selected : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={20} />
                        <span>
                          <span className="block font-bold">{label}</span>
                          <span className="mt-1 block text-xs">{description}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard icon={FiFileText} title="Documento de respaldo">
                  <p className="mb-4 text-sm text-gray-600">
                    Carga un PDF o escanéalo con la cámara. Las imágenes se convierten a PDF al guardar.
                    {formData.tiene_documento_pdf && !documentoPdf ? ' El adjunto actual se conservará si no lo reemplazas.' : ''}
                  </p>
                  {loadingDocumentoPreview && (
                    <div className="mb-4 flex h-20 items-center justify-center text-sm text-gray-500">Cargando vista previa...</div>
                  )}
                  {documentoPreview && (
                    <div className="mb-4 overflow-hidden rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                        <FiEye size={16} />
                        Vista previa {documentoPdf ? 'del archivo seleccionado' : 'del PDF guardado'}
                        {(!documentoPdf || documentoPdf.type === 'application/pdf' || /\.pdf$/i.test(documentoPdf.name)) && (
                          <a
                            href={documentoPreview.url}
                            download={getDocumentoFilename(formData.numero_control || `control-cambios-${editId || 'nuevo'}`)}
                            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-[#8A2036]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#8A2036] hover:bg-[#8A2036] hover:text-white"
                          >
                            <FiDownload size={14} /> Descargar adjunto
                          </a>
                        )}
                      </div>
                      {documentoPreview.type.startsWith('image/') ? (
                        <img src={documentoPreview.url} alt="Vista previa del documento escaneado" className="mx-auto max-h-[600px] w-full bg-gray-100 object-contain" />
                      ) : (
                        <iframe title="Vista previa del PDF adjunto" src={documentoPreview.url} className="h-[600px] w-full" />
                      )}
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition hover:border-[#8A2036]/40 hover:bg-[#8A2036]/5">
                      <FiFileText className="mb-2 text-[#8A2036]" size={22} />
                      <span className="text-sm font-semibold text-gray-800">Cargar PDF</span>
                      <span className="mt-1 text-xs text-gray-500">Selecciona un archivo .pdf</span>
                      <input
                        ref={pdfInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(event) => setDocumentoPdf(event.target.files?.[0] || null)}
                        className="sr-only"
                      />
                    </label>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition hover:border-[#8A2036]/40 hover:bg-[#8A2036]/5">
                      <FiCamera className="mb-2 text-[#8A2036]" size={22} />
                      <span className="text-sm font-semibold text-gray-800">Escanear con cámara</span>
                      <span className="mt-1 text-xs text-gray-500">JPEG, PNG o WEBP</span>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        onChange={(event) => setDocumentoPdf(event.target.files?.[0] || null)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {documentoPdf ? (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                      <span>Seleccionado: {documentoPdf.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setDocumentoPdf(null);
                          if (pdfInputRef.current) pdfInputRef.current.value = '';
                          if (imageInputRef.current) imageInputRef.current.value = '';
                        }}
                        className="rounded-lg p-1 hover:bg-emerald-100"
                        aria-label="Quitar archivo seleccionado"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : null}
                </SectionCard>
              </>
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4">
                <p className="text-sm font-bold uppercase tracking-wide text-gray-700">Resumen del control de cambios</p>
              </div>
              <dl className="divide-y divide-gray-100">
                {[
                  ...(formData.numero_control ? [['Número de control', formData.numero_control]] : []),
                  ['Sistema', formData.nombre_sistema || '—'],
                  ['Fecha de solicitud', formData.fecha_solicitud || '—'],
                  ['Tipo de cambio', formData.tipo_cambio || '—'],
                  ['Prioridad', formData.prioridad || '—'],
                  ['Impacto', formData.impacto || '—'],
                  ['Alcance', formData.cambios_mayores ? 'Cambios mayores' : formData.cambios_menores ? 'Cambios menores' : '—'],
                  ['Solicitante', formData.solicitante_nombre || '—'],
                ].map(([key, val]) => (
                  <div key={key} className="grid grid-cols-1 gap-1 px-5 py-3 text-sm sm:grid-cols-3">
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
      <div className="flex h-56 flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-colorPrimario border-t-transparent" />
        <p className="text-sm text-gray-500">Cargando control de cambios...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
            {mode === 'edit' ? `Editar control${editId ? ` #${editId}` : ''}` : 'Nuevo control'}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-gray-800">Control de cambios</h2>
        </div>
        {formData.numero_control ? (
          <span className="inline-flex w-fit items-center rounded-full bg-[#8A2036]/10 px-3 py-1.5 font-mono text-xs font-semibold text-[#8A2036]">
            {`Número de control: ${formData.numero_control}`}
          </span>
        ) : null}
      </div>

      {/* <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-400">
          <span>Paso {currentStep + 1} de {STEPS.length}</span>
          <span>{solicitudProgress}% solicitud</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${solicitudProgress}%`, backgroundColor: step.color }}
          />
        </div>
      </div> */}

      <div className="mb-8 hidden lg:block">
        <div className="grid grid-cols-5 gap-2">
          {STEPS.map((s, idx) => {
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(idx)}
                disabled={submitting}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Paso ${idx + 1}: ${s.label}`}
                className={`group relative flex min-h-[76px] w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-300 ${
                  isActive
                    ? 'bg-white shadow-lg ring-2 ring-offset-2'
                    : isDone
                      ? 'bg-white/80 shadow-md hover:bg-white hover:shadow-lg'
                      : 'bg-white/40 hover:bg-white/60'
                }`}
                style={isActive ? { ringColor: s.color } : undefined}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                    isActive ? 'text-white shadow-md' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                  }`}
                  style={isActive ? { backgroundColor: s.color } : undefined}
                >
                  {isDone ? <FiCheckCircle size={16} /> : idx + 1}
                </div>
                <div className="min-w-0">
                  <span className={`block truncate text-xs font-semibold uppercase tracking-wide ${
                    isActive ? 'text-gray-800' : isDone ? 'text-gray-700' : 'text-gray-400'
                  }`}>{s.label}</span>
                  <span className={`text-[10px] font-medium ${
                    isActive ? 'text-colorPrimario' : isDone ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {isDone ? 'Completado' : isActive ? 'En progreso' : 'Pendiente'}
                  </span>
                </div>
              </button>
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
            disabled={submitting}
            className={`min-w-0 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              idx === currentStep ? 'text-white shadow-md' : idx < currentStep ? 'bg-colorPrimario/20 text-colorPrimario' : 'bg-gray-100 text-gray-400'
            }`}
            style={idx === currentStep ? { backgroundColor: s.color } : undefined}
          >
            <span className="truncate">{idx < currentStep ? '✓ ' : ''}{idx + 1}. {s.label}</span>
          </button>
        ))}
      </div>

      <section className={`overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br ${step.bg} shadow-xl`} aria-labelledby="control-cambio-step-title">
        <div className="flex items-center gap-4 border-b border-white/50 bg-white/40 px-6 py-5 backdrop-blur-sm md:px-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: step.color }}>
            <step.icon size={26} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Etapa {currentStep + 1} de {STEPS.length}
            </p>
            <h3 id="control-cambio-step-title" className="text-2xl font-extrabold text-gray-800">{step.label}</h3>
            <p className="mt-1 text-sm text-gray-600">{step.description}</p>
          </div>
        </div>

        <div className="bg-white/70 p-6 backdrop-blur-sm md:p-8">
          {renderStepContent()}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/50 bg-white/50 px-6 py-4 backdrop-blur-sm md:px-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => (currentStep === 0 ? navigate('/control-cambios') : goToStep(currentStep - 1))}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#BC955B]/60 px-5 py-2.5 text-sm font-semibold text-[#8A2036] transition hover:bg-[#DAC19A]/25 disabled:opacity-50 sm:w-auto"
            >
              <FiArrowLeft />
              {currentStep === 0 ? 'Cancelar' : 'Anterior'}
            </button>

            {currentStep === STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canGenerate || submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-colorPrimario px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 sm:w-auto"
              >
                <FiCheckCircle size={18} className={submitting ? 'animate-pulse' : ''} />
                {submitting ? 'Enviando...' : mode === 'edit' ? 'Actualizar control' : 'Guardar control'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goToStep(currentStep + 1)}
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
                style={{ backgroundColor: step.color }}
              >
                {submitting ? 'Guardando...' : 'Guardar y continuar'}
                <FiChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      <SearchModal isOpen={modals.sistema} onClose={() => closeModal('sistema')} title="Buscar sistema" searchFunction={sistemasService.filtrado} onSelect={handleSistemaSelect} labelFormatter={(item) => `${item.siglas ? `${item.siglas} - ` : ''}${item.nombre}`} />
      <SearchModal isOpen={modals.solicitante} onClose={() => closeModal('solicitante')} title="Buscar solicitante" searchFunction={empleadosService.filtrado} onSelect={handlePersonSelect('solicitante_id', 'solicitante_nombre')} labelFormatter={(item) => `${item.nombre || ''} ${item.apellidos || ''}`.trim()} />
      <SearchModal isOpen={modals.responsable_desarrollo} onClose={() => closeModal('responsable_desarrollo')} title="Responsable de desarrollo" searchFunction={usersService.filtrado} onSelect={handlePersonSelect('responsable_desarrollo_id', 'responsable_desarrollo')} labelFormatter={employeeName} />
      <SearchModal isOpen={modals.responsable_pruebas} onClose={() => closeModal('responsable_pruebas')} title="Responsable de pruebas" searchFunction={usersService.filtrado} onSelect={handlePersonSelect('responsable_pruebas_id', 'responsable_pruebas')} labelFormatter={employeeName} />
      <SearchModal isOpen={modals.responsable_autorizacion} onClose={() => closeModal('responsable_autorizacion')} title="Responsable de autorización" searchFunction={usersService.filtrado} onSelect={handlePersonSelect('responsable_autorizacion_id', 'responsable_autorizacion')} labelFormatter={employeeName} />
      <SearchModal isOpen={modals.responsable_produccion} onClose={() => closeModal('responsable_produccion')} title="Responsable de producción" searchFunction={usersService.filtrado} onSelect={handlePersonSelect('responsable_produccion_id', 'responsable_produccion')} labelFormatter={employeeName} />
      <SearchModal isOpen={modals.firmante_area_solicitante} onClose={() => closeModal('firmante_area_solicitante')} title="Firmante del área solicitante" searchFunction={empleadosService.filtrado} onSelect={handleSignerSelect('firmante_area_solicitante_id', 'firmante_area_solicitante', 'cargo_area_solicitante')} labelFormatter={employeeName} />
      <SearchModal isOpen={modals.firmante_desarrollo} onClose={() => closeModal('firmante_desarrollo')} title="Firmante de desarrollo" searchFunction={empleadosService.filtrado} onSelect={handleSignerSelect('firmante_desarrollo_id', 'firmante_desarrollo', 'cargo_desarrollo')} labelFormatter={employeeName} />
      <SearchModal isOpen={modals.firmante_director} onClose={() => closeModal('firmante_director')} title="Director DGDITI" searchFunction={empleadosService.filtrado} onSelect={handleSignerSelect('firmante_director_id', 'firmante_director', 'cargo_director')} labelFormatter={employeeName} />
    </div>
  );
};

export default ControlCambioForm;
