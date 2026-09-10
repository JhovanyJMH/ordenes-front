import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAdscripcion, clearError } from '../../features/adscripciones/adscripcionesSlice';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaIdCard } from 'react-icons/fa';

const AdscripcionForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.adscripciones);

  const [form, setForm] = useState({
    codigo: '',
    descripcion: '',
    direccion: 'DIRECCION',
    lada: '',
    telefono: '',
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
        ubicacion_lt: Number(form.ubicacion_lt) || 0,
        ubicacion_ln: Number(form.ubicacion_ln) || 0,
      };
      await dispatch(createAdscripcion(payload)).unwrap();
      Swal.fire({ title: 'Éxito', text: 'Adscripción creada', icon: 'success', timer: 1500, showConfirmButton: false });
      navigate('/catalogo-adscripciones');
    } catch (err) {
      Swal.fire('Error', err || 'No se pudo crear', 'error');
      dispatch(clearError());
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Crear Nueva Adscripción</h2>
        <p className="text-gray-600">Complete el formulario para registrar una nueva adscripción</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#8A2036] to-[#6B1829] px-6 py-4 flex items-center gap-3">
            <FaBuilding className="text-white text-xl" />
            <h3 className="text-lg font-semibold text-white">Información de la Adscripción</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaIdCard className="text-gray-400" size={14} />
                  Código <span className="text-red-500">*</span>
                </label>
                <input
                  name="codigo"
                  value={form.codigo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese el código"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaBuilding className="text-gray-400" size={14} />
                  Descripción <span className="text-red-500">*</span>
                </label>
                <input
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese la descripción"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400" size={14} />
                  Dirección
                </label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese la dirección"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lada" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaPhone className="text-gray-400" size={14} />
                  LADA
                </label>
                <input
                  name="lada"
                  value={form.lada}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="722"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaPhone className="text-gray-400" size={14} />
                  Teléfono
                </label>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#8A2036] focus:ring-[#8A2036]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese el teléfono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/catalogo-adscripciones')}
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

export default AdscripcionForm;
