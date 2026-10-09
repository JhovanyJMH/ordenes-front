import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { FiDownload, FiClipboard, FiLayers, FiAlertTriangle, FiActivity, FiSearch, FiCheckCircle, FiArrowLeft, FiArrowRight, FiEye, FiLock, FiUnlock } from 'react-icons/fi';
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
  { id: 'solicitud', label: 'Solicitud', description: 'Datos generales, sistema y documentación de respaldo.', icon: FiClipboard, color: '#8A2036' },
  { id: 'cambio', label: 'Cambio requerido', description: 'Clasifica el cambio, su prioridad y los ambientes involucrados.', icon: FiLayers, color: '#1f7a8c' },
  { id: 'impacto', label: 'Análisis de impacto', description: 'Registra el alcance y los elementos que podrían verse afectados.', icon: FiAlertTriangle, color: '#d97706' },
  { id: 'historial', label: 'Implementación', description: 'Documenta desarrollo, pruebas, autorización, producción y firmas.', icon: FiActivity, color: '#0f766e' },
  { id: 'generar', label: 'Guardar', description: 'Verifica el resumen antes de guardar el registro.', icon: FiDownload, color: '#8A2036' },
];

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white/95 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#8A2036] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/20 transition-all shadow-sm';
const labelClass = 'block text-sm font-semibold text-gray-800 mb-2 tracking-tight';

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

const CheckGroup = ({ title, items, formData, onChange }) => (
  <div className="rounded-xl border border-gray-200/60 bg-white/95 p-5 shadow-sm">
    <h3 className="mb-4 text-sm font-bold text-gray-800 tracking-tight">{title}</h3>
    <div className="space-y-3">
      {items.map(([name, label]) => (
        <label key={name} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
          <input type="checkbox" name={name} checked={Boolean(formData[name])} onChange={onChange} className="h-4 w-4 accent-[#8A2036]" />
          {label}
        </label>
      ))}
    </div>
  </div>
);

const RadioGroup = ({ title, name, options, formData, onChange, cols = 1 }) => (
  <div className="rounded-xl border border-gray-200/60 bg-white/95 p-5 shadow-sm">
    <h3 className="mb-4 text-sm font-bold text-gray-800 tracking-tight">{title}</h3>
    <div className={cols === 1 ? 'space-y-3' : 'grid gap-3 md:grid-cols-3'}>
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
          <input type="radio" name={name} value={opt} checked={formData[name] === opt} onChange={onChange} className="h-4 w-4 accent-[#8A2036]" />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

const PersonField = ({ label, value, onOpen, focusRing }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="flex gap-2">
      <input type="text" value={value} readOnly placeholder="Buscar empleado..." className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm cursor-pointer" onClick={onOpen} style={focusRing} />
      <button type="button" onClick={onOpen} className="rounded-lg bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-4 py-3 text-white shadow-md">
        <FiSearch size={18} />
      </button>
    </div>
  </div>
);

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

  const canGenerate = useMemo(
    () => Boolean(formData.sistema_id && formData.nombre_sistema && formData.fecha_solicitud),
    [formData.sistema_id, formData.nombre_sistema, formData.fecha_solicitud],
  );

  const step = STEPS[currentStep];
  const focusRing = { '--tw-ring-color': step.color };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
            <div className="rounded-xl border border-gray-200/60 bg-white/95 p-6 shadow-lg">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Fecha de solicitud</label>
                  <input type="date" name="fecha_solicitud" value={formData.fecha_solicitud} onChange={handleChange} className={inputClass} />
                </div>
                {formData.numero_control && (
                  <div>
                    <label className={labelClass}>Número de control</label>
                    <input type="text" name="numero_control" value={formData.numero_control} readOnly className={`${inputClass} bg-gray-50`} />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className={labelClass}>Sistema del catálogo</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.nombre_sistema} readOnly placeholder="Buscar sistema..." className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm" onClick={() => openModal('sistema')} />
                    <button type="button" onClick={() => openModal('sistema')} className="rounded-lg bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-4 py-3 text-white shadow-md"><FiSearch size={18} /></button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Nombre del sistema</label>
                  <input type="text" name="nombre_sistema" value={formData.nombre_sistema} onChange={handleChange} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Descripción de la solicitud</label>
                  <textarea name="descripcion_solicitud" value={formData.descripcion_solicitud} onChange={handleChange} rows={3} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Módulo / Funcionalidad</label>
                  <input type="text" name="modulo_funcionalidad" value={formData.modulo_funcionalidad} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Usuarios afectados</label>
                  <input type="text" name="usuarios_afectados" value={formData.usuarios_afectados} onChange={handleChange} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Justificación</label>
                  <textarea name="justificacion" value={formData.justificacion} onChange={handleChange} rows={3} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Área solicitante</label>
                  <input type="text" name="area_solicitante" value={formData.area_solicitante} onChange={handleChange} className={inputClass} />
                </div>
                <PersonField label="Nombre y firma del solicitante" value={formData.solicitante_nombre} onOpen={() => openModal('solicitante')} focusRing={focusRing} />
              </div>
            </div>
            <CheckGroup
              title="Documento de respaldo"
              formData={formData}
              onChange={handleChange}
              items={[
                ['respaldo_oficio', 'Oficio formal de solicitud'],
                ['respaldo_correo', 'Correo institucional de solicitud'],
                ['respaldo_minuta', 'Minuta de reunión autorizada'],
                ['respaldo_pruebas', 'Evidencia de pruebas realizadas'],
              ]}
            />
          </div>
        );
      case 'cambio':
        return (
          <div className="space-y-6">
            <CheckGroup
              title="Ambiente"
              formData={formData}
              onChange={handleChange}
              items={[
                ['ambiente_pruebas', 'Ambiente Pruebas'],
                ['ambiente_productivo', 'Ambiente Productivo'],
              ]}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <RadioGroup title="Impacto" name="impacto" options={['Crítico', 'Moderado', 'Bajo']} formData={formData} onChange={handleChange} />
              <RadioGroup title="Prioridad" name="prioridad" options={['Alta', 'Media', 'Baja']} formData={formData} onChange={handleChange} />
            </div>
            <RadioGroup title="Tipo de cambio" name="tipo_cambio" options={['Correctivo', 'Preventivo', 'Evolutivo', 'Adaptativo', 'Mejora Funcional']} formData={formData} onChange={handleChange} cols={3} />
            <CheckGroup
              title="Clasificación adicional"
              formData={formData}
              onChange={handleChange}
              items={[
                ['clasificacion_frontend', 'Frontend'],
                ['clasificacion_backend', 'Backend'],
                ['clasificacion_bd', 'Base de Datos'],
                ['clasificacion_infraestructura', 'Infraestructura / Servidor'],
              ]}
            />
          </div>
        );
      case 'impacto':
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200/60 bg-white/95 p-6 shadow-lg">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Fecha de análisis</label>
                  <input type="date" name="fecha_analisis" value={formData.fecha_analisis} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Elementos afectados</label>
                  <input type="text" name="elementos_afectados" value={formData.elementos_afectados} onChange={handleChange} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <h3 className="mb-3 text-sm font-bold text-gray-800">Alcance del cambio</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[['menores', 'Cambios menores'], ['mayores', 'Cambios mayores']].map(([value, label]) => (
                      <label key={value} className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="alcance_cambio"
                          checked={value === 'menores' ? formData.cambios_menores : formData.cambios_mayores}
                          onChange={() => handleAlcanceChange(value)}
                          className="h-4 w-4 accent-[#8A2036]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Descripción</label>
                  <textarea name="descripcion_impacto" value={formData.descripcion_impacto} onChange={handleChange} rows={3} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Alcance</label>
                  <textarea name="alcance" value={formData.alcance} onChange={handleChange} rows={3} className={inputClass} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'historial':
        return (
          <div className="space-y-6">
            {[
              {
                title: 'Aplicación del cambio en Ambiente de Desarrollo',
                fields: (
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Fecha</label>
                      <input type="date" name="fecha_desarrollo" value={formData.fecha_desarrollo} onChange={handleChange} className={inputClass} />
                    </div>
                    <PersonField label="Responsable de realizar cambios" value={formData.responsable_desarrollo} onOpen={() => openModal('responsable_desarrollo')} focusRing={focusRing} />
                    <div className="md:col-span-2">
                      <label className={labelClass}>Solución</label>
                      <textarea name="solucion" value={formData.solucion} onChange={handleChange} rows={2} className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Revisiones</label>
                      <textarea name="revisiones" value={formData.revisiones} onChange={handleChange} rows={2} className={inputClass} />
                    </div>
                  </div>
                ),
              },
              {
                title: 'Aplicación del cambio en Ambiente de Pruebas',
                fields: (
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Fecha</label>
                      <input type="date" name="fecha_pruebas" value={formData.fecha_pruebas} onChange={handleChange} className={inputClass} />
                    </div>
                    <PersonField label="Responsable de las pruebas" value={formData.responsable_pruebas} onOpen={() => openModal('responsable_pruebas')} focusRing={focusRing} />
                    <div className="md:col-span-2">
                      <label className={labelClass}>Observaciones</label>
                      <textarea name="observaciones_pruebas" value={formData.observaciones_pruebas} onChange={handleChange} rows={2} className={inputClass} />
                    </div>
                  </div>
                ),
              },
              {
                title: 'Autorización para liberación a Producción',
                fields: (
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Fecha</label>
                      <input type="date" name="fecha_autorizacion" value={formData.fecha_autorizacion} onChange={handleChange} className={inputClass} />
                    </div>
                    <PersonField label="Responsable" value={formData.responsable_autorizacion} onOpen={() => openModal('responsable_autorizacion')} focusRing={focusRing} />
                    <div className="md:col-span-2">
                      <label className={labelClass}>Observaciones</label>
                      <textarea name="observaciones_autorizacion" value={formData.observaciones_autorizacion} onChange={handleChange} rows={2} className={inputClass} />
                    </div>
                  </div>
                ),
              },
              {
                title: 'Aplicación de cambios en Ambiente Productivo',
                fields: (
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Fecha</label>
                      <input type="date" name="fecha_produccion" value={formData.fecha_produccion} onChange={handleChange} className={inputClass} />
                    </div>
                    <PersonField label="Responsable" value={formData.responsable_produccion} onOpen={() => openModal('responsable_produccion')} focusRing={focusRing} />
                    <div className="md:col-span-2">
                      <label className={labelClass}>Resultado de implementación</label>
                      <textarea name="resultado_implementacion" value={formData.resultado_implementacion} onChange={handleChange} rows={2} className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Observaciones</label>
                      <textarea name="observaciones_produccion" value={formData.observaciones_produccion} onChange={handleChange} rows={2} className={inputClass} />
                    </div>
                  </div>
                ),
              },
            ].map((section) => (
              <div key={section.title} className="rounded-xl border border-gray-200/60 bg-white/95 p-6 shadow-lg">
                <p className="mb-4 border-b border-gray-200 pb-3 text-sm font-bold uppercase tracking-wide text-gray-700">{section.title}</p>
                {section.fields}
              </div>
            ))}
            <div className="rounded-xl border border-gray-200/60 bg-white/95 p-6 shadow-lg">
              <p className="mb-4 border-b border-gray-200 pb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Firmas</p>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <PersonField label="Área solicitante" value={formData.firmante_area_solicitante} onOpen={() => openModal('firmante_area_solicitante')} focusRing={focusRing} />
                  <input type="text" name="cargo_area_solicitante" value={formData.cargo_area_solicitante} onChange={handleChange} className={`${inputClass} mt-2`} />
                </div>
                <div>
                  <PersonField label="Responsable de desarrollo" value={formData.firmante_desarrollo} onOpen={() => openModal('firmante_desarrollo')} focusRing={focusRing} />
                  <input type="text" name="cargo_desarrollo" value={formData.cargo_desarrollo} onChange={handleChange} className={`${inputClass} mt-2`} />
                </div>
                <div className="md:col-span-2">
                  <PersonField label="Director DGDITI" value={formData.firmante_director} onOpen={() => openModal('firmante_director')} focusRing={focusRing} />
                  <input type="text" name="cargo_director" value={formData.cargo_director} onChange={handleChange} className={`${inputClass} mt-2`} />
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
                <p className="text-sm font-bold text-gray-800 tracking-tight">Guardar control de cambios</p>
                <p className="mt-1 text-sm text-gray-600">Revisa el resumen y elige el estado del registro antes de guardar.</p>
              </div>
            </div>
            {mode === 'edit' && (
              <div className="rounded-xl border border-gray-200/60 bg-white/95 p-5 shadow-sm">
                <p className={labelClass}>Estado del control de cambios</p>
                <p className="mb-3 text-sm text-gray-600">Elige si el registro quedará abierto o cerrado al actualizar.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: 1, label: 'Abierto', description: 'El control podrá seguir actualizándose.', selected: 'border-emerald-600 bg-emerald-50 text-emerald-800' },
                    { value: 0, label: 'Cerrado', description: 'El control quedará marcado como cerrado.', selected: 'border-stone-500 bg-stone-100 text-stone-800' },
                  ].map(({ value, label, description, selected }) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={Number(formData.estatus) === value}
                      onClick={() => setFormData((prev) => ({ ...prev, estatus: value }))}
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                        Number(formData.estatus) === value
                          ? selected
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {value === 1 ? <FiUnlock size={20} /> : <FiLock size={20} />}
                      <span>
                        <span className="block font-bold">{label}</span>
                        <span className="mt-1 block text-xs">{description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {mode === 'edit' && (
              <div className="rounded-xl border border-gray-200/60 bg-white/95 p-5 shadow-sm">
                <h3 className="mb-2 text-sm font-bold text-gray-800">Adjuntar PDF (opcional)</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Carga un PDF o escanéalo con la cámara. Las imágenes se convierten a PDF al guardar.
                  {formData.tiene_documento_pdf && !documentoPdf && ' El adjunto actual se conservará si no lo reemplazas.'}
                </p>
                {loadingDocumentoPreview && (
                  <div className="mb-4 flex h-20 items-center justify-center text-sm text-gray-500">Cargando vista previa...</div>
                )}
                {documentoPreview && (
                  <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
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
                  <label className="block text-sm font-medium text-gray-700">
                    Cargar PDF
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(event) => setDocumentoPdf(event.target.files?.[0] || null)}
                      className={`${inputClass} mt-2`}
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    Escanear con cámara
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      capture="environment"
                      onChange={(event) => setDocumentoPdf(event.target.files?.[0] || null)}
                      className={`${inputClass} mt-2`}
                    />
                  </label>
                </div>
                {documentoPdf && <p className="mt-2 text-sm text-gray-700">Seleccionado: {documentoPdf.name}</p>}
              </div>
            )}
            <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white/95 shadow-lg">
              <div className="border-b border-gray-200/60 px-5 py-4">
                <p className="text-sm font-bold uppercase tracking-wide text-gray-700">Resumen del control de cambios</p>
              </div>
              <dl className="divide-y divide-gray-200/60">
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
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-colorPrimario border-t-transparent" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#8A2036] to-[#BC955B]" />
          <span className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">Gestión de cambios</span>
          <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-[#BC955B] to-[#8A2036]" />
        </div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-colorPrimario sm:text-2xl">
              {mode === 'edit' ? `Editar control de cambios #${editId}` : 'Nuevo control de cambios'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">Registro y seguimiento de solicitudes de cambio.</p>
          </div>
          <p className="text-sm font-semibold text-gray-500">
            <span className="text-lg text-colorPrimario">{String(currentStep + 1).padStart(2, '0')}</span>
            <span className="mx-1">/</span>{String(STEPS.length).padStart(2, '0')} pasos
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
                disabled={submitting}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Paso ${idx + 1}: ${s.label}`}
                className={`flex min-h-[76px] min-w-0 items-center gap-2 rounded-xl border bg-white px-3 py-3 text-left transition-all sm:min-h-[84px] sm:flex-col sm:justify-center sm:gap-2 sm:text-center ${isActive ? 'shadow-md ring-2 ring-[#8A2036]/15' : isCompleted ? 'border-emerald-200 hover:border-emerald-300' : 'border-gray-200 hover:border-gray-300'}`}
                style={isActive ? { borderColor: s.color } : undefined}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isActive ? 'text-white' : isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`} style={isActive ? { backgroundColor: s.color } : undefined}>
                  {isCompleted ? <FiCheckCircle size={18} /> : <s.icon size={17} />}
                </div>
                <span className={`min-w-0 text-xs font-semibold leading-tight ${isActive ? 'text-gray-900' : isCompleted ? 'text-emerald-700' : 'text-gray-500'}`}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="space-y-6" aria-labelledby="control-cambio-step-title">
        <div className="flex items-start gap-4 rounded-xl border-l-4 bg-white/80 p-5 shadow-sm" style={{ borderColor: step.color }}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100" style={{ color: step.color }}>
            <step.icon size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Paso {currentStep + 1} de {STEPS.length}</p>
            <h3 id="control-cambio-step-title" className="mt-1 text-base font-bold text-gray-800">{step.label}</h3>
            <p className="mt-1 text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
        <div className="space-y-6">{renderStepContent()}</div>
      </section>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button type="button" onClick={() => goToStep(currentStep - 1)} disabled={currentStep === 0 || submitting} className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:border-[#8A2036] hover:text-[#8A2036] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-600">
          <FiArrowLeft />
          Anterior
        </button>
        {currentStep === STEPS.length - 1 ? (
          <button type="button" onClick={handleSubmit} disabled={!canGenerate || submitting} className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all ${canGenerate && !submitting ? 'bg-gradient-to-r from-[#8A2036] to-[#a9354c] hover:-translate-y-0.5 hover:shadow-lg' : 'cursor-not-allowed bg-gray-300'}`}>
            <FiDownload />
            {submitting ? 'Enviando...' : mode === 'edit' ? 'Actualizar control' : 'Guardar control'}
          </button>
        ) : (
          <button type="button" onClick={() => goToStep(currentStep + 1)} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? 'Guardando...' : 'Siguiente'}
            <FiArrowRight />
          </button>
        )}
      </div>

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
