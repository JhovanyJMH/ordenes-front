import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  FiActivity,
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClipboard,
  FiCode,
  FiDatabase,
  FiDownload,
  FiFileText,
  FiServer,
  FiSettings,
  FiUser,
} from 'react-icons/fi';
import sistemasService from '../../services/sistemasService';
import sistemasPrincipalesService from '../../services/sistemasPrincipalesService';
import adscripcionesService from '../../services/adscripcionesService';
import empleadosService from '../../services/empleadosService';
import usersService from '../../services/usersService';
import SearchModal from '../common/SearchModal';
import {
  AMBIENTE_OPTIONS,
  ChoiceButton,
  ESTADO_OPERATIVO_OPTIONS,
  FieldLabel,
  INFRAESTRUCTURA_OPTIONS,
  NIVEL_IMPACTO_OPTIONS,
  SI_NO_OPTIONS,
  SearchPicker,
  SectionCard,
  SummaryItem,
  TIPO_SISTEMA_OPTIONS,
  buildSistemaPayload,
  emptySistema,
  empleadoDisplayName,
  inputClass,
  mapSistemaToForm,
  userDisplayName,
  withCurrentOption,
} from './sistemaFormUtils';

const STEPS = [
  { id: 'identificacion', label: 'Identificación', description: 'Nombre, versión, estado operativo y entorno de despliegue.', icon: FiClipboard, color: '#8A2036', bg: 'from-[#8A2036]/10 to-[#BC955B]/5' },
  { id: 'responsables', label: 'Responsables', description: 'Unidad administrativa, enlace y líder del sistema.', icon: FiUser, color: '#1f7a8c', bg: 'from-[#1f7a8c]/10 to-teal-50' },
  { id: 'funcionalidad', label: 'Funcionalidad', description: 'Objetivo, alcance, módulos y descripción del sistema.', icon: FiFileText, color: '#0f766e', bg: 'from-emerald-100/80 to-teal-50' },
  { id: 'tecnologia', label: 'Tecnología', description: 'Plataforma, arquitectura, código, documentación y base de datos.', icon: FiSettings, color: '#BC955B', bg: 'from-[#DAC19A]/30 to-[#BC955B]/10' },
  { id: 'revision', label: 'Revisión', description: 'Confirma el resumen y guarda el registro del sistema.', icon: FiDownload, color: '#8A2036', bg: 'from-[#8A2036]/10 to-[#BC955B]/5' },
];

const interoperableLabel = (value) => {
  if (value === 'true') return 'Sí';
  if (value === 'false') return 'No';
  return 'Sin especificar';
};

const SistemaForm = ({ mode = 'create', editId = null }) => {
  const { id: routeId, sistemaPrincipalId } = useParams();
  const id = editId || routeId;
  const isEdit = mode === 'edit' || Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptySistema);
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const submittingRef = useRef(false);
  const containerRef = useRef(null);
  const [modals, setModals] = useState({
    adscripcion: false,
    enlace_empleado: false,
    lider_administrador: false,
  });

  const step = STEPS[currentStep];
  const listPath = sistemaPrincipalId ? `/catalogo-sistemas/${sistemaPrincipalId}/sistemas` : '/catalogo-sistemas';

  useEffect(() => {
    if (!id) return;
    sistemasService.getSistemaById(id)
      .then((data) => setForm(mapSistemaToForm(data)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!sistemaPrincipalId || id) return;
    sistemasPrincipalesService.getSistemaPrincipalById(sistemaPrincipalId)
      .then((sistemaPrincipal) => {
        setForm((current) => ({ ...current, sistema_principal: sistemaPrincipal }));
      })
      .catch((error) => {
        Swal.fire({ icon: 'error', title: 'No se pudo cargar el sistema principal', text: error.response?.data?.message || 'Intenta nuevamente.' });
      });
  }, [id, sistemaPrincipalId]);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const openModal = (modalName) => setModals((prev) => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName) => setModals((prev) => ({ ...prev, [modalName]: false }));

  const goToStep = (idx) => {
    if (idx === currentStep || submitting) return;
    if (idx > 0 && !form.nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Falta el nombre', text: 'Captura el nombre del sistema para continuar.' });
      return;
    }
    setCurrentStep(idx);
  };

  const submit = async () => {
    if (submittingRef.current) return;
    if (!form.nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'El nombre del sistema es obligatorio.' });
      setCurrentStep(0);
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const payload = buildSistemaPayload(form, sistemaPrincipalId);
      if (id) await sistemasService.updateSistema(id, payload);
      else await sistemasService.createSistema(payload);
      await Swal.fire({
        icon: 'success',
        title: isEdit ? 'Sistema actualizado' : 'Sistema creado',
        timer: 1400,
        showConfirmButton: false,
      });
      navigate(listPath);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.response?.data?.message || 'Revisa los datos capturados.' });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step.id) {
      case 'identificacion':
        return (
          <div className="space-y-6">
            {sistemaPrincipalId ? (
              <div className="rounded-2xl border border-colorPrimario/20 bg-white px-4 py-3 text-sm text-gray-700">
                Registrando un sistema para <strong>{form.sistema_principal?.descripcion || `#${sistemaPrincipalId}`}</strong>.
              </div>
            ) : null}

            <SectionCard icon={FiServer} title="Datos generales">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FieldLabel required>Nombre del sistema</FieldLabel>
                  <input name="nombre" value={form.nombre || ''} onChange={handleChange} className={inputClass} placeholder="Nombre oficial del sistema" />
                </div>
                <div>
                  <FieldLabel>Nombre corto / siglas</FieldLabel>
                  <input name="siglas" value={form.siglas || ''} onChange={handleChange} className={inputClass} placeholder="Ej. S-OR" />
                </div>
                <div>
                  <FieldLabel>Versión</FieldLabel>
                  <input name="version" value={form.version || ''} onChange={handleChange} className={inputClass} placeholder="Ej. 1.0.0" />
                </div>
                <div>
                  <FieldLabel>Año de desarrollo</FieldLabel>
                  <input name="anio_desarrollo" type="number" value={form.anio_desarrollo || ''} onChange={handleChange} className={inputClass} placeholder="Ej. 2024" />
                </div>
                <div>
                  <FieldLabel>URL</FieldLabel>
                  <input name="url" value={form.url || ''} onChange={handleChange} className={inputClass} placeholder="https://" />
                </div>
              </div>
            </SectionCard>

            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title="Estado operativo">
                <div className="space-y-3">
                  {withCurrentOption(ESTADO_OPERATIVO_OPTIONS, form.estado_operativo).map(([option, description]) => (
                    <ChoiceButton
                      key={option}
                      selected={form.estado_operativo === option}
                      onClick={() => setField('estado_operativo', option)}
                      title={option}
                      description={description}
                    />
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Nivel de impacto">
                <div className="space-y-3">
                  {withCurrentOption(NIVEL_IMPACTO_OPTIONS, form.nivel_impacto).map(([option, description, accent]) => (
                    <ChoiceButton
                      key={option}
                      selected={form.nivel_impacto === option}
                      onClick={() => setField('nivel_impacto', option)}
                      title={option}
                      description={description}
                      accent={accent}
                    />
                  ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard icon={FiActivity} title="Tipo de sistema">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {withCurrentOption(TIPO_SISTEMA_OPTIONS, form.tipo_sistema).map(([option, description]) => (
                  <ChoiceButton
                    key={option}
                    selected={form.tipo_sistema === option}
                    onClick={() => setField('tipo_sistema', option)}
                    title={option}
                    description={description}
                  />
                ))}
              </div>
            </SectionCard>

            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title="Ambiente de despliegue">
                <div className="space-y-3">
                  {withCurrentOption(AMBIENTE_OPTIONS, form.ambiente_despliegue).map(([option, description]) => (
                    <ChoiceButton
                      key={option}
                      selected={form.ambiente_despliegue === option}
                      onClick={() => setField('ambiente_despliegue', option)}
                      title={option}
                      description={description}
                    />
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Tipo de infraestructura">
                <div className="space-y-3">
                  {withCurrentOption(INFRAESTRUCTURA_OPTIONS, form.tipo_infraestructura).map(([option, description]) => (
                    <ChoiceButton
                      key={option}
                      selected={form.tipo_infraestructura === option}
                      onClick={() => setField('tipo_infraestructura', option)}
                      title={option}
                      description={description}
                      accent="#0f766e"
                    />
                  ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard icon={FiCalendar} title="Fechas">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <FieldLabel>Conclusión del desarrollo</FieldLabel>
                  <input type="date" name="fecha_conclusion_desarrollo" value={form.fecha_conclusion_desarrollo || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <FieldLabel>Liberación a producción</FieldLabel>
                  <input type="date" name="fecha_liberacion_produccion" value={form.fecha_liberacion_produccion || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <FieldLabel>Última actualización</FieldLabel>
                  <input type="date" name="ultima_actualizacion" value={form.ultima_actualizacion || ''} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </SectionCard>
          </div>
        );

      case 'responsables':
        return (
          <div className="grid gap-6">
            <SectionCard icon={FiUser} title="Unidad y responsables">
              <div className="grid gap-5">
                <SearchPicker
                  label="Unidad administrativa responsable"
                  value={form.adscripcion_nombre}
                  filled={Boolean(form.adscripcion_id)}
                  placeholder="Buscar adscripción..."
                  onOpen={() => openModal('adscripcion')}
                />
                <SearchPicker
                  label="Enlace de la unidad administrativa"
                  value={form.enlace_empleado_nombre}
                  filled={Boolean(form.enlace_empleado_id)}
                  placeholder="Buscar empleado..."
                  onOpen={() => openModal('enlace_empleado')}
                />
                <SearchPicker
                  label="Líder o administrador del sistema"
                  value={form.lider_administrador_nombre}
                  filled={Boolean(form.lider_administrador_id)}
                  placeholder="Buscar usuario..."
                  onOpen={() => openModal('lider_administrador')}
                />
              </div>
            </SectionCard>
          </div>
        );

      case 'funcionalidad':
        return (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              {[
                ['objetivo', 'Objetivo'],
                ['descripcion_funcional', 'Descripción funcional'],
                ['principales_modulos', 'Principales módulos'],
                ['alcance', 'Alcance del sistema'],
              ].map(([name, label]) => (
                <label key={name} className={name === 'alcance' ? 'md:col-span-2' : ''}>
                  <FieldLabel>{label}</FieldLabel>
                  <textarea name={name} value={form[name] || ''} onChange={handleChange} rows={name === 'alcance' ? 4 : 7} className={inputClass} />
                </label>
              ))}
            </div>
          </div>
        );

      case 'tecnologia':
        return (
          <div className="space-y-6">
            <SectionCard icon={FiCode} title="Plataforma y arquitectura">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['plataforma_desarrollo', 'Plataforma de desarrollo'],
                  ['arquitectura', 'Arquitectura del sistema'],
                  ['lenguaje_desarrollo', 'Lenguaje de desarrollo'],
                  ['framework', 'Framework (si aplica)'],
                  ['gestor_base_datos', 'Gestor de base de datos'],
                  ['repositorio_codigo', 'Repositorio del código'],
                  ['actualizacion_documentacion', 'Actualización de documentación'],
                ].map(([name, label]) => (
                  <div key={name} className={name === 'repositorio_codigo' ? 'md:col-span-2' : ''}>
                    <FieldLabel>{label}</FieldLabel>
                    <input name={name} value={form[name] || ''} onChange={handleChange} className={inputClass} />
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className="grid gap-6 lg:grid-cols-3">
              <SectionCard icon={FiCode} title="Código fuente">
                <div className="space-y-3">
                  {withCurrentOption(SI_NO_OPTIONS, form.cuenta_codigo_fuente).map(([option, description]) => (
                    <ChoiceButton
                      key={option}
                      selected={form.cuenta_codigo_fuente === option}
                      onClick={() => setField('cuenta_codigo_fuente', option)}
                      title={option}
                      description={description}
                    />
                  ))}
                </div>
              </SectionCard>
              <SectionCard icon={FiFileText} title="Documentación técnica">
                <div className="space-y-3">
                  {withCurrentOption(SI_NO_OPTIONS, form.cuenta_documentacion_tecnica).map(([option, description]) => (
                    <ChoiceButton
                      key={`doc-${option}`}
                      selected={form.cuenta_documentacion_tecnica === option}
                      onClick={() => setField('cuenta_documentacion_tecnica', option)}
                      title={option}
                      description={description}
                    />
                  ))}
                </div>
              </SectionCard>
              <SectionCard icon={FiDatabase} title="¿Es interoperable?">
                <div className="space-y-3">
                  <ChoiceButton selected={form.es_interoperable === 'true'} onClick={() => setField('es_interoperable', 'true')} title="Sí" description="Intercambia información con otros sistemas" accent="#0f766e" />
                  <ChoiceButton selected={form.es_interoperable === 'false'} onClick={() => setField('es_interoperable', 'false')} title="No" description="Opera de forma independiente" accent="#6b7280" />
                </div>
              </SectionCard>
            </div>
          </div>
        );

      case 'revision':
        return (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryItem label="Nombre" value={form.nombre} />
              <SummaryItem label="Siglas" value={form.siglas} />
              <SummaryItem label="Versión" value={form.version} />
              <SummaryItem label="Estado" value={form.estado_operativo} />
              <SummaryItem label="Impacto" value={form.nivel_impacto} />
              <SummaryItem label="Tipo" value={form.tipo_sistema} />
              <SummaryItem label="Ambiente" value={form.ambiente_despliegue} />
              <SummaryItem label="Infraestructura" value={form.tipo_infraestructura} />
              <SummaryItem label="Unidad responsable" value={form.adscripcion_nombre} />
              <SummaryItem label="Enlace" value={form.enlace_empleado_nombre} />
              <SummaryItem label="Líder / administrador" value={form.lider_administrador_nombre} />
              <SummaryItem label="Interoperable" value={interoperableLabel(form.es_interoperable)} />
            </div>
            <SectionCard title="Observaciones y vigencia">
              <label className="block">
                <FieldLabel>Observaciones</FieldLabel>
                <textarea name="observaciones" value={form.observaciones || ''} onChange={handleChange} rows={4} className={inputClass} />
              </label>
              <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-gray-700">
                <input type="checkbox" name="activo" checked={Boolean(form.activo)} onChange={handleChange} />
                Sistema activo
              </label>
            </SectionCard>
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
        <p className="text-sm text-gray-500">Cargando sistema...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-6xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
          {isEdit ? `Editar sistema${id ? ` #${id}` : ''}` : 'Nuevo sistema / versión'}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-gray-800">
          {form.sistema_principal?.descripcion || 'Registro del sistema'}
        </h2>
      </div>

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
                className={`group relative flex min-h-[76px] w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-300 ${
                  isActive ? 'bg-white shadow-lg ring-2 ring-offset-2' : isDone ? 'bg-white/80 shadow-md hover:bg-white hover:shadow-lg' : 'bg-white/40 hover:bg-white/60'
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
                  <span className={`block truncate text-xs font-semibold uppercase tracking-wide ${isActive ? 'text-gray-800' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-colorPrimario' : isDone ? 'text-emerald-600' : 'text-gray-400'}`}>
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

      <section className={`overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br ${step.bg} shadow-xl`} aria-labelledby="sistema-step-title">
        <div className="flex items-center gap-4 border-b border-white/50 bg-white/40 px-6 py-5 backdrop-blur-sm md:px-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: step.color }}>
            <step.icon size={26} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Etapa {currentStep + 1} de {STEPS.length}</p>
            <h3 id="sistema-step-title" className="text-2xl font-extrabold text-gray-800">{step.label}</h3>
            <p className="mt-1 text-sm text-gray-600">{step.description}</p>
          </div>
        </div>

        <div className="bg-white/70 p-6 backdrop-blur-sm md:p-8">{renderStepContent()}</div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/50 bg-white/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <button
            type="button"
            onClick={() => (currentStep === 0 ? navigate(listPath) : goToStep(currentStep - 1))}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#BC955B]/60 px-5 py-2.5 text-sm font-semibold text-[#8A2036] transition hover:bg-[#DAC19A]/25 disabled:opacity-50 sm:w-auto"
          >
            <FiArrowLeft />
            {currentStep === 0 ? 'Cancelar' : 'Anterior'}
          </button>
          {currentStep === STEPS.length - 1 ? (
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !form.nombre.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-colorPrimario px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
            >
              <FiCheckCircle size={18} className={submitting ? 'animate-pulse' : ''} />
              {submitting ? 'Guardando...' : isEdit ? 'Actualizar sistema' : 'Guardar sistema'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goToStep(currentStep + 1)}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
              style={{ backgroundColor: step.color }}
            >
              Continuar
              <FiChevronRight size={18} />
            </button>
          )}
        </div>
      </section>

      <SearchModal
        isOpen={modals.adscripcion}
        onClose={() => closeModal('adscripcion')}
        title="Buscar adscripción"
        searchFunction={adscripcionesService.filtrado}
        onSelect={(option) => setForm((prev) => ({
          ...prev,
          adscripcion_id: option?.value || '',
          adscripcion_nombre: option?.label || '',
        }))}
        labelFormatter={(item) => item.descripcion}
      />
      <SearchModal
        isOpen={modals.enlace_empleado}
        onClose={() => closeModal('enlace_empleado')}
        title="Buscar empleado"
        searchFunction={empleadosService.filtrado}
        onSelect={(option) => setForm((prev) => ({
          ...prev,
          enlace_empleado_id: option?.value || '',
          enlace_empleado_nombre: option?.label || '',
        }))}
        labelFormatter={empleadoDisplayName}
      />
      <SearchModal
        isOpen={modals.lider_administrador}
        onClose={() => closeModal('lider_administrador')}
        title="Buscar usuario"
        searchFunction={usersService.filtrado}
        onSelect={(option) => setForm((prev) => ({
          ...prev,
          lider_administrador_id: option?.value || '',
          lider_administrador_nombre: option?.label || '',
        }))}
        labelFormatter={userDisplayName}
      />
    </div>
  );
};

export default SistemaForm;
