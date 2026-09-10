import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEquipo, clearError } from '../../features/equipos/equiposSlice';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaDesktop, FaTag, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';

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
      Swal.fire({ title: 'Éxito', text: 'Equipo creado', icon: 'success', timer: 1500, showConfirmButton: false });
      navigate('/catalogo-equipos');
    } catch (err) {
      Swal.fire('Error', err || 'No se pudo crear', 'error');
      dispatch(clearError());
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Crear Nuevo Equipo</h2>
        <p className="text-gray-600">Complete el formulario para registrar un nuevo equipo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#BC955B] to-[#9A7A4A] px-6 py-4 flex items-center gap-3">
            <FaDesktop className="text-white text-xl" />
            <h3 className="text-lg font-semibold text-white">Información del Equipo</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaDesktop className="text-gray-400" size={14} />
                  Descripción <span className="text-red-500">*</span>
                </label>
                <input
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese la descripción"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="marca" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaTag className="text-gray-400" size={14} />
                  Marca
                </label>
                <input
                  name="marca"
                  value={form.marca}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese la marca"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="modelo" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaTag className="text-gray-400" size={14} />
                  Modelo
                </label>
                <input
                  name="modelo"
                  value={form.modelo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese el modelo"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="fecha_adq" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaCalendar className="text-gray-400" size={14} />
                  Fecha adquisición
                </label>
                <input
                  type="date"
                  name="fecha_adq"
                  value={form.fecha_adq}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="inventario" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaTag className="text-gray-400" size={14} />
                  Inventario
                </label>
                <input
                  name="inventario"
                  value={form.inventario}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese el inventario"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="serie" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaTag className="text-gray-400" size={14} />
                  Serie
                </label>
                <input
                  name="serie"
                  value={form.serie}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese la serie"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="estatus" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaDesktop className="text-gray-400" size={14} />
                  Estatus <span className="text-red-500">*</span>
                </label>
                <select
                  name="estatus"
                  value={form.estatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900"
                >
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-2 space-y-2">
                <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400" size={14} />
                  Ubicación
                </label>
                <input
                  name="ubicacion"
                  value={form.ubicacion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese la ubicación"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/catalogo-equipos')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[#BC955B] to-[#9A7A4A] text-white hover:from-[#9A7A4A] hover:to-[#8A6A3A] focus:outline-none focus:ring-2 focus:ring-[#BC955B]/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EquipoForm;
