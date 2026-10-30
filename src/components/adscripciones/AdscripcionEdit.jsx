import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdscripcionById, updateAdscripcion, clearError } from '../../features/adscripciones/adscripcionesSlice';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiHome, FiMapPin, FiPhone, FiHash } from 'react-icons/fi';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm transition-all duration-300 focus:border-[#8A2036] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/20 focus:shadow-md hover:border-gray-300';
const labelClass = 'mb-2.5 block text-sm font-semibold tracking-tight text-gray-800';

const FieldLabel = ({ children, required, htmlFor }) => (
  <label htmlFor={htmlFor} className={labelClass}>
    {children}
    {required ? <span className="ml-1 text-[#8A2036]">*</span> : null}
  </label>
);

const SectionCard = ({ icon: Icon, title, children, variant = 'primary' }) => {
  const variants = {
    primary: {
      border: 'border-[#8A2036]/20',
      bg: 'bg-gradient-to-br from-[#8A2036]/5 to-[#BC955B]/5',
      text: 'text-[#8A2036]',
      iconBg: 'bg-[#8A2036]/10'
    },
    secondary: {
      border: 'border-[#1f7a8c]/20',
      bg: 'bg-gradient-to-br from-[#1f7a8c]/5 to-teal-50',
      text: 'text-[#1f7a8c]',
      iconBg: 'bg-[#1f7a8c]/10'
    },
    accent: {
      border: 'border-[#BC955B]/10',
      bg: 'bg-gradient-to-br from-[#DAC19A]/15 to-[#BC955B]/5',
      text: 'text-[#BC955B]/80',
      iconBg: 'bg-[#BC955B]/5'
    },
    success: {
      border: 'border-emerald-200',
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100'
    }
  };
  const style = variants[variant] || variants.primary;
  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}>
      {title ? (
        <div className={`mb-5 flex items-center gap-3 ${style.text}`}>
          {Icon ? (
            <div className={`rounded-lg p-2 ${style.iconBg}`}>
              <Icon size={20} />
            </div>
          ) : null}
          <span className="text-sm font-bold uppercase tracking-wider">{title}</span>
        </div>
      ) : null}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

const AdscripcionEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selected, loading } = useSelector((s) => s.adscripciones);

  const [form, setForm] = useState({
    codigo: '',
    descripcion: '',
    direccion: '',
    lada: '',
    telefono: '',
    ubicacion_lt: '0',
    ubicacion_ln: '0',
  });

  useEffect(() => { dispatch(getAdscripcionById(id)); }, [dispatch, id]);

  useEffect(() => {
    if (selected) {
      setForm({
        codigo: selected.codigo || '',
        descripcion: selected.descripcion || '',
        direccion: selected.direccion || '',
        lada: selected.lada || '',
        telefono: selected.telefono || '',
        ubicacion_lt: String(selected.ubicacion_lt ?? 0),
        ubicacion_ln: String(selected.ubicacion_ln ?? 0),
      });
    }
  }, [selected]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        ubicacion_lt: Number(form.ubicacion_lt) || 0,
        ubicacion_ln: Number(form.ubicacion_ln) || 0,
      };
      await dispatch(updateAdscripcion({ id, data: payload })).unwrap();
      navigate('/catalogo-adscripciones');
    } catch (err) {
      Swal.fire('Error', err || 'No se pudo actualizar', 'error');
      dispatch(clearError());
    }
  };

  if (!selected && loading) {
    return <div className="flex justify-center h-32 items-center"><div className="animate-spin h-10 w-10 border-4 border-[#8A2036] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-[#8A2036] to-[#BC955B]"></div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Editar adscripción</p>
        </div>
        <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">Editar Adscripción</h2>
        <p className="mt-2 text-base text-gray-600 leading-relaxed">Actualice la información de la adscripción en el sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard icon={FiHome} title="Información de la Adscripción" variant="primary">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <FieldLabel required htmlFor="codigo">Código</FieldLabel>
              <input
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Ingrese el código"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <FieldLabel required htmlFor="descripcion">Descripción</FieldLabel>
              <input
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Ingrese la descripción"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <FieldLabel htmlFor="direccion">Dirección</FieldLabel>
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ingrese la dirección"
              />
            </div>
            <div>
              <FieldLabel htmlFor="lada">LADA</FieldLabel>
              <input
                name="lada"
                value={form.lada}
                onChange={handleChange}
                className={inputClass}
                placeholder="722"
              />
            </div>
            <div>
              <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ingrese el teléfono"
              />
            </div>
          </div>
        </SectionCard>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end pt-4">
          <button
            type="button"
            onClick={() => navigate('/catalogo-adscripciones')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#BC955B]/60 bg-white px-6 py-3 text-sm font-semibold text-[#8A2036] shadow-sm transition-all duration-200 hover:bg-[#DAC19A]/10 hover:shadow-md active:scale-[0.98] sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8A2036] to-[#6B1829] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8A2036]/20 transition-all duration-200 hover:shadow-xl hover:shadow-[#8A2036]/30 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdscripcionEdit;
