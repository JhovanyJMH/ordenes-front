import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEquipo, clearError } from '../../features/equipos/equiposSlice';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiMonitor, FiTag, FiCalendar, FiMapPin } from 'react-icons/fi';

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

const EquipoForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.equipos);

  const [form, setForm] = useState({
    descripcion: '',
    marca: '',
    modelo: '',
    fecha_adq: '',
    serie: '',
    inventario: '',
    estatus: '1',
    ubicacion: '',
    ubicacion_lt: '0',
    ubicacion_ln: '0',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        fecha_adq: form.fecha_adq || null,
        ubicacion_lt: Number(form.ubicacion_lt) || 0,
        ubicacion_ln: Number(form.ubicacion_ln) || 0,
      };
      await dispatch(createEquipo(payload)).unwrap();
      navigate('/catalogo-equipos');
    } catch (err) {
      Swal.fire('Error', err || 'No se pudo crear', 'error');
      dispatch(clearError());
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-[#8A2036] to-[#BC955B]"></div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Nuevo equipo</p>
        </div>
        <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">Crear Nuevo Equipo</h2>
        <p className="mt-2 text-base text-gray-600 leading-relaxed">Complete el formulario para registrar un nuevo equipo en el sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard icon={FiMonitor} title="Información del Equipo" variant="primary">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <div>
              <FieldLabel htmlFor="marca">Marca</FieldLabel>
              <input
                name="marca"
                value={form.marca}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ingrese la marca"
              />
            </div>
            <div>
              <FieldLabel htmlFor="modelo">Modelo</FieldLabel>
              <input
                name="modelo"
                value={form.modelo}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ingrese el modelo"
              />
            </div>
            <div>
              <FieldLabel htmlFor="fecha_adq">Fecha adquisición</FieldLabel>
              <input
                type="date"
                name="fecha_adq"
                value={form.fecha_adq}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="inventario">Inventario</FieldLabel>
              <input
                name="inventario"
                value={form.inventario}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ingrese el inventario"
              />
            </div>
            <div>
              <FieldLabel htmlFor="serie">Serie</FieldLabel>
              <input
                name="serie"
                value={form.serie}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ingrese la serie"
              />
            </div>
            <div>
              <FieldLabel required htmlFor="estatus">Estatus</FieldLabel>
              <select
                name="estatus"
                value={form.estatus}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <FieldLabel htmlFor="ubicacion">Ubicación</FieldLabel>
              <input
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ingrese la ubicación"
              />
            </div>
          </div>
        </SectionCard>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end pt-4">
          <button
            type="button"
            onClick={() => navigate('/catalogo-equipos')}
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
              'Guardar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EquipoForm;
