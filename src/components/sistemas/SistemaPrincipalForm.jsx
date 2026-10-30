import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiArrowLeft, FiCheckCircle, FiChevronRight, FiClipboard, FiLayers } from 'react-icons/fi';
import { createSistemaPrincipal, updateSistemaPrincipal, getSistemaPrincipalById, clearError } from '../../features/sistemasPrincipales/sistemasPrincipalesSlice';
import { ChoiceButton, FieldLabel, SectionCard, SummaryItem, inputClass } from './sistemaFormUtils';

const STEPS = [
  { id: 'datos', label: 'Identificación', description: 'Nombre y estatus del sistema principal del catálogo.', icon: FiClipboard, color: '#8A2036', bg: 'from-[#8A2036]/10 to-[#BC955B]/5' },
  { id: 'revision', label: 'Revisión', description: 'Confirma los datos y guarda el sistema principal.', icon: FiLayers, color: '#1f7a8c', bg: 'from-[#1f7a8c]/10 to-teal-50' },
];

const SistemaPrincipalForm = ({ mode = 'create', editId = null }) => {
  const { id: routeId } = useParams();
  const id = editId || routeId;
  const isEdit = mode === 'edit' || Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected, loading } = useSelector((s) => s.sistemasPrincipales);
  const [form, setForm] = useState({ descripcion: '', estatus: '1' });
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const submittingRef = useRef(false);
  const containerRef = useRef(null);
  const step = STEPS[currentStep];

  useEffect(() => {
    if (mode === 'edit' && editId) {
      dispatch(getSistemaPrincipalById(editId));
    }
  }, [dispatch, mode, editId]);

  useEffect(() => {
    if (selected && mode === 'edit') {
      setForm({ descripcion: selected.descripcion, estatus: String(selected.estatus) });
    }
  }, [selected, mode]);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  const goToStep = (idx) => {
    if (idx === currentStep || submitting) return;
    if (idx > 0 && !form.descripcion.trim()) {
      Swal.fire({ icon: 'warning', title: 'Falta el nombre', text: 'Captura el nombre del sistema principal para continuar.' });
      return;
    }
    setCurrentStep(idx);
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      if (id) {
        await dispatch(updateSistemaPrincipal({ id, data: form })).unwrap();
      } else {
        await dispatch(createSistemaPrincipal(form)).unwrap();
      }
      navigate('/catalogo-sistemas');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error || 'Revisa los datos capturados.' });
      dispatch(clearError());
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#8A2036] border-t-transparent" />
        <p className="text-sm text-gray-500">Cargando sistema principal...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
          {isEdit ? `Editar sistema principal${id ? ` #${id}` : ''}` : 'Nuevo sistema principal'}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-gray-800">Catálogo de sistemas</h2>
      </div>

      <div className="mb-8 hidden sm:grid sm:grid-cols-2 sm:gap-2">
        {STEPS.map((s, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => goToStep(idx)}
              disabled={submitting}
              className={`group relative flex min-h-[76px] w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-300 ${
                isActive ? 'bg-white shadow-lg ring-2 ring-offset-2' : isDone ? 'bg-white/80 shadow-md hover:bg-white' : 'bg-white/40 hover:bg-white/60'
              }`}
              style={isActive ? { ringColor: s.color } : undefined}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                  isActive ? 'text-white shadow-md' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                }`}
                style={isActive ? { backgroundColor: s.color } : undefined}
              >
                {isDone ? <FiCheckCircle size={16} /> : idx + 1}
              </div>
              <div>
                <span className={`block text-xs font-semibold uppercase tracking-wide ${isActive ? 'text-gray-800' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
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

      <section className={`overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br ${step.bg} shadow-xl`}>
        <div className="flex items-center gap-4 border-b border-white/50 bg-white/40 px-6 py-5 backdrop-blur-sm md:px-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: step.color }}>
            <step.icon size={26} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Etapa {currentStep + 1} de {STEPS.length}</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{step.label}</h3>
            <p className="mt-1 text-sm text-gray-600">{step.description}</p>
          </div>
        </div>

        <div className="bg-white/70 p-6 backdrop-blur-sm md:p-8">
          {step.id === 'datos' ? (
            <SectionCard icon={FiClipboard} title="Datos del sistema principal">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FieldLabel required>Nombre del sistema principal</FieldLabel>
                  <input
                    name="descripcion"
                    value={form.descripcion}
                    onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
                    required
                    maxLength={255}
                    className={inputClass}
                    placeholder="Ej. Sistema de Almacén"
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Estatus</FieldLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ChoiceButton
                      selected={form.estatus === '1'}
                      onClick={() => setForm((current) => ({ ...current, estatus: '1' }))}
                      title="Activo"
                      description="Visible y disponible en el catálogo"
                    />
                    <ChoiceButton
                      selected={form.estatus === '0'}
                      onClick={() => setForm((current) => ({ ...current, estatus: '0' }))}
                      title="Inactivo"
                      description="Queda fuera de operación"
                      accent="#6b7280"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <SummaryItem label="Nombre" value={form.descripcion} />
              <SummaryItem label="Estatus" value={form.estatus === '1' ? 'Activo' : 'Inactivo'} />
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/50 bg-white/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <button
            type="button"
            onClick={() => (currentStep === 0 ? navigate('/catalogo-sistemas') : goToStep(currentStep - 1))}
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
              disabled={submitting || !form.descripcion.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-colorPrimario px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
            >
              <FiCheckCircle size={18} />
              {submitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Guardar'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goToStep(currentStep + 1)}
              className="inline-flex w-full items-center justify-center gap-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md sm:w-auto"
              style={{ backgroundColor: step.color }}
            >
              Continuar
              <FiChevronRight size={18} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default SistemaPrincipalForm;
