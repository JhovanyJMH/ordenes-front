import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import {
  FiDownload,
  FiLayers,
  FiCheckCircle,
  FiClipboard,
  FiActivity,
  FiSearch,
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
  FiCode,
  FiDatabase,
  FiSettings,
  FiX,
} from 'react-icons/fi';
import liberacionService, { getDocumentoFilename } from '../../services/liberacionService';
import empleadosService from '../../services/empleadosService';
import usersService from '../../services/usersService';
import sistemasService from '../../services/sistemasService';
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
  { id: 'generar', label: 'Revisión', description: 'Confirma el resumen y guarda la ficha de liberación.', icon: FiDownload, color: '#8A2036', bg: 'from-[#8A2036]/10 to-[#BC955B]/5' },
];

const ENTREGABLES = [
  { label: 'Frontend', include: 'Archivos compilados / proyecto frontend', routeKey: 'f_ruta', statusKey: 'entregable_frontend_estado', icon: FiCode },
  { label: 'Backend', include: 'API / servicios / lógica de negocio', routeKey: 'b_ruta', statusKey: 'entregable_backend_estado', icon: FiServer },
  { label: 'Base de Datos', include: 'Scripts SQL / migraciones', routeKey: 'bd_ruta', statusKey: 'entregable_bd_estado', icon: FiDatabase },
  { label: 'Variables de entorno', include: 'Variables .env o plantilla necesarias para la operación.', routeKey: 'var_entorno', statusKey: 'entregable_variables_estado', icon: FiSettings },
];

const VALIDACIONES = [
  { title: 'Pruebas funcionales', responsible: 'Desarrollo', resultKey: 'validacion_pruebas_resultado' },
  { title: 'Validación funcional del usuario solicitante', responsible: 'Área usuaria', resultKey: 'validacion_acceso_resultado' },
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

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    {title ? (
      <div className="mb-4 flex items-center gap-2 text-[#8A2036]">
        {Icon ? <Icon size={18} /> : null}
        <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
      </div>
    ) : null}
    {children}
  </div>
);

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

const userDisplayName = (user) => {
  if (!user) return '';
  if (typeof user === 'string') return user.trim();
  if (user.nombre_completo?.trim()) return user.nombre_completo.trim();
  return [user.name, user.ap_paterno, user.ap_materno].filter(Boolean).join(' ').trim();
};

const LiberacionForm = ({ mode = 'create', editId = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const recordIdRef = useRef(mode === 'edit' ? editId : null);
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef(null);
  const documentoPdfInputRef = useRef(null);
  const documentoImagenInputRef = useRef(null);
  const [documentoPdf, setDocumentoPdf] = useState(null);
  const [documentoPreview, setDocumentoPreview] = useState(null);
  const [loadingDocumentoPreview, setLoadingDocumentoPreview] = useState(false);

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
    liberacionService.downloadDocumento(editId)
      .then((blob) => {
        if (!cancelled) setPreviewFromBlob(blob);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la vista previa del documento PDF.',
          });
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

  const missingIdentification = useMemo(() => {
    const missing = [];
    if (!formData.fecha_solicitud) missing.push('Fecha de solicitud');
    if (!formData.fecha_liberacion) missing.push('Fecha de liberación');
    if (!formData.lider_proyecto) missing.push('Líder del proyecto');
    if (!formData.sistema_id) missing.push('Sistema del catálogo');
    if (!formData.nombre_sistema) missing.push('Nombre del sistema');
    if (!formData.version) missing.push('Versión');
    if (!formData.tipo_liberacion) missing.push('Tipo de liberación');
    if (!formData.prioridad) missing.push('Prioridad');
    if (!formData.ambiente_pruebas && !formData.ambiente_produccion) missing.push('Ambiente');
    return missing;
  }, [formData]);

  const canGenerate = missingIdentification.length === 0;

  const identificationProgress = useMemo(() => {
    const total = 9;
    const filled = total - missingIdentification.length;
    return Math.max(0, Math.min(100, Math.round((filled / total) * 100)));
  }, [missingIdentification]);

  const saveProgress = async () => {
    if (submitLockRef.current) return false;
    if (!canGenerate) {
      await Swal.fire({
        icon: 'warning',
        title: 'Completa los datos de identificación',
        text: 'Antes de continuar, captura las fechas, el líder, el sistema, la versión, el tipo, la prioridad y al menos un ambiente.',
      });
      return false;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        estatus: Number(formData.estatus ?? 1),
      };
      const documento = await preparePdfDocument(documentoPdf);
      const multipartPayload = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        multipartPayload.append(key, value === true ? '1' : value === false ? '0' : value ?? '');
      });
      if (documento) multipartPayload.append('documento_pdf', documento);

      let response;
      if (recordIdRef.current) {
        response = await liberacionService.updateLiberacion(recordIdRef.current, multipartPayload);
      } else {
        response = await liberacionService.createLiberacion(multipartPayload);
        const savedId = response?.data?.id || response?.id;
        if (!savedId) throw new Error('La ficha se guardó, pero no se recibió su identificador.');
        recordIdRef.current = savedId;
      }

      const savedRecord = response?.data || response;
      setFormData((current) => ({
        ...current,
        numero_control: savedRecord?.numero_control || current.numero_control,
        tiene_documento_pdf: savedRecord?.tiene_documento_pdf ?? (documento ? true : current.tiene_documento_pdf),
      }));
      if (documento) {
        setDocumentoPdf(null);
        if (documentoPdfInputRef.current) documentoPdfInputRef.current.value = '';
        if (documentoImagenInputRef.current) documentoImagenInputRef.current.value = '';
      }
      return true;
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar el paso',
        text: error?.response?.data?.message || error.message || 'No se pudo guardar el progreso de la ficha.',
      });
      return false;
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const goToStep = async (idx) => {
    if (idx === currentStep || submitting) return;
    if (await saveProgress()) setCurrentStep(idx);
  };
  const step = STEPS[currentStep];

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

    if (await saveProgress()) {
      await Swal.fire({
        icon: 'success',
        title: mode === 'edit' || editId ? 'Ficha actualizada' : 'Ficha guardada',
        text: 'La ficha se guardó correctamente.',
        timer: 1400,
        showConfirmButton: false,
      });
      navigate('/fichas-liberacion');
    }
  };

  const renderStepContent = () => {
    switch (step.id) {
      case 'generales':
        return (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard icon={FiCalendar} title="Fechas">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel required>Fecha solicitud</FieldLabel>
                    <input type="date" name="fecha_solicitud" value={formData.fecha_solicitud} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <FieldLabel required>Fecha liberación</FieldLabel>
                    <input type="date" name="fecha_liberacion" value={formData.fecha_liberacion} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={FiUser} title="Responsable">
                <SearchPicker
                  label="Líder del proyecto"
                  required
                  value={formData.lider_proyecto}
                  placeholder="Buscar empleado..."
                  onOpen={() => openModal('lider_proyecto')}
                />
              </SectionCard>
            </div>

            <SectionCard icon={FiServer} title="Sistema">
              <div className="grid gap-4 md:grid-cols-2">
                <SearchPicker
                  label="Sistema del catálogo"
                  required
                  value={formData.nombre_sistema}
                  placeholder="Buscar sistema..."
                  onOpen={() => openModal('sistema')}
                  filled={Boolean(formData.sistema_id)}
                  hint="La selección del catálogo asigna las siglas para generar el número de control."
                />
                <div>
                  <FieldLabel required>Nombre del sistema</FieldLabel>
                  <input
                    type="text"
                    name="nombre_sistema"
                    value={formData.nombre_sistema}
                    onChange={handleChange}
                    placeholder="Nombre del sistema"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel required>Versión</FieldLabel>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    placeholder="Ej. 1.0.0"
                    readOnly={Boolean(formData.sistema_id)}
                    className={`${inputClass} ${formData.sistema_id ? 'bg-gray-50' : ''}`}
                  />
                  {formData.sistema_id ? (
                    <p className="mt-2 text-xs text-gray-500">La versión se toma del catálogo. Cambia el sistema si necesitas otra versión.</p>
                  ) : null}
                </div>
              </div>
            </SectionCard>

            <div className="grid gap-6 lg:grid-cols-3">
              <SectionCard title="Ambiente">
                <p className="mb-3 text-xs text-gray-500">Selecciona al menos uno. *</p>
                <div className="space-y-3">
                  <ChoiceButton
                    selected={formData.ambiente_pruebas}
                    onClick={() => setFormData((prev) => ({ ...prev, ambiente_pruebas: !prev.ambiente_pruebas }))}
                    title="Pruebas"
                    description="Ambiente de validación previa"
                  />
                  <ChoiceButton
                    selected={formData.ambiente_produccion}
                    onClick={() => setFormData((prev) => ({ ...prev, ambiente_produccion: !prev.ambiente_produccion }))}
                    title="Producción"
                    description="Ambiente operativo"
                    accent="#0f766e"
                  />
                </div>
              </SectionCard>

              <SectionCard title="Tipo de liberación">
                <div className="space-y-3">
                  {[
                    ['Nueva versión', 'Entrega completa o incremento'],
                    ['Corrección', 'Ajuste de incidencias'],
                    ['Mejora', 'Optimización o nueva función'],
                  ].map(([option, description]) => (
                    <ChoiceButton
                      key={option}
                      selected={formData.tipo_liberacion === option}
                      onClick={() => setFormData((prev) => ({ ...prev, tipo_liberacion: option }))}
                      title={option}
                      description={description}
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
          </div>
        );

      case 'entregables':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {ENTREGABLES.map(({ label, include, routeKey, statusKey, icon: Icon }) => {
              const status = formData[statusKey];
              return (
                <div key={statusKey} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1f7a8c]/10 text-[#1f7a8c]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{include}</p>
                    </div>
                  </div>
                  <FieldLabel htmlFor={routeKey}>Ruta o archivo</FieldLabel>
                  <input
                    id={routeKey}
                    type="text"
                    name={routeKey}
                    value={formData[routeKey]}
                    onChange={handleChange}
                    placeholder="Ruta, repositorio o nombre de archivo"
                    className={inputClass}
                  />
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[
                      ['aplica', 'Aplica'],
                      ['no_aplica', 'No aplica'],
                    ].map(([value, text]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, [statusKey]: value }))}
                        className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                          status === value
                            ? value === 'aplica'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                              : 'border-stone-400 bg-stone-100 text-stone-700'
                            : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'validaciones':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {VALIDACIONES.map(({ title, responsible, resultKey }) => {
                const current = formData[resultKey];
                return (
                  <div key={resultKey} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="font-bold text-gray-800">{title}</p>
                    <p className="mt-1 text-xs text-gray-500">Responsable: {responsible}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        ['Correcto', 'border-emerald-600 bg-emerald-50 text-emerald-800'],
                        ['Error', 'border-rose-600 bg-rose-50 text-rose-800'],
                        ['No aplica', 'border-stone-400 bg-stone-100 text-stone-700'],
                      ].map(([result, selectedClass]) => (
                        <button
                          key={result}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, [resultKey]: result }))}
                          className={`rounded-xl border-2 px-2 py-3 text-center text-xs font-bold transition sm:text-sm ${
                            current === result ? selectedClass : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {result}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <SectionCard icon={FiFileText} title="Observaciones">
              <textarea
                name="observaciones_finales"
                value={formData.observaciones_finales}
                onChange={handleChange}
                rows={4}
                placeholder="Hallazgos, restricciones o notas que deban quedar en la ficha."
                className={inputClass}
              />
            </SectionCard>
          </div>
        );

      case 'firmas':
        return (
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ['Responsable de recepción y publicación', 'responsable_infraestructura', 'cargo_infraestructura', 'Selecciona a quien publica y recibe la liberación.'],
              ['Responsable de entrega técnica', 'responsable_desarrollo', 'cargo_desarrollo', 'Selecciona a quien entrega el desarrollo.'],
            ].map(([title, field, cargoField, hint]) => (
              <div key={field} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-[#BC955B]">
                  <FiUser size={18} />
                  <span className="text-sm font-bold uppercase tracking-wide text-[#8A2036]">{title}</span>
                </div>
                <SearchPicker
                  value={formData[field]}
                  placeholder="Buscar empleado..."
                  onOpen={() => openModal(field)}
                  hint={hint}
                />
                <div className="mt-4">
                  <FieldLabel htmlFor={cargoField}>Cargo para el PDF</FieldLabel>
                  <input
                    id={cargoField}
                    type="text"
                    name={cargoField}
                    value={formData[cargoField]}
                    onChange={handleChange}
                    placeholder="Cargo"
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'generar':
        return (
          <div className="space-y-6">
            {!canGenerate ? (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="font-semibold">Faltan datos de identificación</p>
                  <p className="mt-1 text-amber-800">{missingIdentification.join(' · ')}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <FiCheckCircle className="mt-0.5 shrink-0" size={18} />
                <p>La identificación está completa. Revisa el resumen antes de guardar.</p>
              </div>
            )}

            {mode === 'edit' && (
              <>
                <SectionCard title="Estado de la ficha">
                  <p className="mb-3 text-sm text-gray-600">Define si la ficha quedará abierta o cerrada al guardar.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { value: 1, label: 'Abierta', description: 'Podrá seguir actualizándose.', icon: FiUnlock, selected: 'border-emerald-600 bg-emerald-50 text-emerald-800' },
                      { value: 0, label: 'Cerrada', description: 'Quedará marcada como cerrada.', icon: FiLock, selected: 'border-stone-500 bg-stone-100 text-stone-800' },
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
                    Visualiza el documento guardado o elige un PDF para sustituirlo. También puedes capturar una imagen; se convertirá a PDF al guardar.
                    {formData.tiene_documento_pdf && !documentoPdf ? ' El archivo actual se conservará si no lo reemplazas.' : ''}
                  </p>
                  {loadingDocumentoPreview && (
                    <div className="mb-4 flex h-20 items-center justify-center text-sm text-gray-500">Cargando vista previa...</div>
                  )}
                  {documentoPreview && (
                    <div className="mb-4 overflow-hidden rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                        <FiEye size={16} />
                        Vista previa {documentoPdf ? 'del archivo seleccionado' : 'del documento guardado'}
                        {(!documentoPdf || documentoPdf.type === 'application/pdf' || /\.pdf$/i.test(documentoPdf.name)) && (
                          <a
                            href={documentoPreview.url}
                            download={getDocumentoFilename(formData.numero_control || `liberacion-${editId}`, formData.version)}
                            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-[#8A2036]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#8A2036] hover:bg-[#8A2036] hover:text-white"
                          >
                            <FiDownload size={14} /> Descargar adjunto
                          </a>
                        )}
                      </div>
                      {documentoPreview.type.startsWith('image/') ? (
                        <img src={documentoPreview.url} alt="Vista previa del documento escaneado" className="mx-auto max-h-[600px] w-full bg-gray-100 object-contain" />
                      ) : (
                        <iframe title="Vista previa del documento PDF" src={documentoPreview.url} className="h-[600px] w-full" />
                      )}
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition hover:border-[#8A2036]/40 hover:bg-[#8A2036]/5">
                      <FiFileText className="mb-2 text-[#8A2036]" size={22} />
                      <span className="text-sm font-semibold text-gray-800">Cargar PDF</span>
                      <span className="mt-1 text-xs text-gray-500">Selecciona un archivo .pdf</span>
                      <input
                        ref={documentoPdfInputRef}
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
                        ref={documentoImagenInputRef}
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
                          if (documentoPdfInputRef.current) documentoPdfInputRef.current.value = '';
                          if (documentoImagenInputRef.current) documentoImagenInputRef.current.value = '';
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
                <p className="text-sm font-bold uppercase tracking-wide text-gray-700">Resumen de la ficha</p>
              </div>
              <dl className="divide-y divide-gray-100">
                {[
                  ['Número de control', formData.numero_control || 'Se asignará al guardar'],
                  ['Fecha de solicitud', formData.fecha_solicitud || '—'],
                  ['Fecha de liberación', formData.fecha_liberacion || '—'],
                  ['Líder del proyecto', formData.lider_proyecto || '—'],
                  ['Sistema', formData.nombre_sistema || '—'],
                  ['Versión', formData.version || '—'],
                  ['Ambiente', [formData.ambiente_pruebas && 'Pruebas', formData.ambiente_produccion && 'Producción'].filter(Boolean).join(', ') || '—'],
                  ['Tipo de liberación', formData.tipo_liberacion || '—'],
                  ['Prioridad', formData.prioridad || '—'],
                  ['Entregables', ENTREGABLES.map(({ label, statusKey }) => (
                    formData[statusKey] ? `${label}: ${formData[statusKey] === 'aplica' ? 'Aplica' : 'No aplica'}` : null
                  )).filter(Boolean).join(' · ') || '—'],
                  ['Pruebas funcionales', formData.validacion_pruebas_resultado || '—'],
                  ['Validación funcional del usuario solicitante', formData.validacion_acceso_resultado || '—'],
                  ['Responsable de recepción y publicación', formData.responsable_infraestructura || '—'],
                  ['Cargo de infraestructura', formData.cargo_infraestructura || '—'],
                  ['Responsable de entrega técnica', formData.responsable_desarrollo || '—'],
                  ['Cargo de desarrollo', formData.cargo_desarrollo || '—'],
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
      <div className="flex h-56 flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-colorPrimario border-t-transparent" />
        <p className="text-sm text-gray-500">Cargando ficha de liberación...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
            {mode === 'edit' ? `Editar ficha${editId ? ` #${editId}` : ''}` : 'Nueva ficha'}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-gray-800">Ficha de liberación</h2>
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
          <span>{identificationProgress}% identificación</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${identificationProgress}%`, backgroundColor: step.color }}
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

      <section className={`overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br ${step.bg} shadow-xl`} aria-labelledby="liberacion-step-title">
        <div className="flex items-center gap-4 border-b border-white/50 bg-white/40 px-6 py-5 backdrop-blur-sm md:px-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: step.color }}>
            <step.icon size={26} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Etapa {currentStep + 1} de {STEPS.length}
            </p>
            <h3 id="liberacion-step-title" className="text-2xl font-extrabold text-gray-800">{step.label}</h3>
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
              onClick={() => (currentStep === 0 ? navigate('/fichas-liberacion') : goToStep(currentStep - 1))}
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
                {submitting ? 'Enviando...' : mode === 'edit' ? 'Actualizar ficha' : 'Guardar ficha'}
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
