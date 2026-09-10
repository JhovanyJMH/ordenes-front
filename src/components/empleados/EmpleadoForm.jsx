import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEmpleado, clearError } from '../../features/empleados/empleadosSlice';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaUser, FaIdCard, FaBriefcase, FaEnvelope, FaCalendar } from 'react-icons/fa';

const EmpleadoForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.empleados);

  const [form, setForm] = useState({
    clave: '',
    nombre: '',
    apellidos: '',
    puesto: '',
    email: '',
    fecha_nac: '',
    estatus: '1',
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
        estatus: form.estatus === '1' ? 1 : 0,
      };
      await dispatch(createEmpleado(payload)).unwrap();
      Swal.fire({ title: 'Éxito', text: 'Empleado creado', icon: 'success', timer: 1500, showConfirmButton: false });
      navigate('/catalogo-empleados');
    } catch (err) {
      Swal.fire('Error', err || 'No se pudo crear', 'error');
      dispatch(clearError());
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Crear Nuevo Empleado</h2>
        <p className="text-gray-600">Complete el formulario para registrar un nuevo empleado</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#8A2036] to-[#6B1829] px-6 py-4 flex items-center gap-3">
            <FaUser className="text-white text-xl" />
            <h3 className="text-lg font-semibold text-white">Información Personal</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="clave" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaIdCard className="text-gray-400" size={14} />
                  Clave <span className="text-red-500">*</span>
                </label>
                <input
                  name="clave"
                  value={form.clave}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese la clave"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaUser className="text-gray-400" size={14} />
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 uppercase placeholder-gray-400"
                  placeholder="Ingrese el nombre"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaUser className="text-gray-400" size={14} />
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <input
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 uppercase placeholder-gray-400"
                  placeholder="Ingrese los apellidos"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="puesto" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaBriefcase className="text-gray-400" size={14} />
                  Puesto <span className="text-red-500">*</span>
                </label>
                <input
                  name="puesto"
                  value={form.puesto}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese el puesto"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaEnvelope className="text-gray-400" size={14} />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="fecha_nac" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaCalendar className="text-gray-400" size={14} />
                  Fecha de nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_nac"
                  value={form.fecha_nac}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="estatus" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaUser className="text-gray-400" size={14} />
                  Estatus
                </label>
                <select
                  name="estatus"
                  value={form.estatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900"
                >
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/catalogo-empleados')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[#8A2036] to-[#6B1829] text-white hover:from-[#6B1829] hover:to-[#5A1223] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmpleadoForm;
