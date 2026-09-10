import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getServicioById, updateServicio, clearError } from '../../features/servicios/serviciosSlice';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaCog } from 'react-icons/fa';

const ServicioEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categoriaId, id } = useParams();
  const { selected, loading, error } = useSelector((s) => s.servicios);

  const [form, setForm] = useState({ descripcion: '', estatus: '1' });

  useEffect(() => { dispatch(getServicioById(id)); }, [dispatch, id]);

  useEffect(() => {
    if (selected) {
      setForm({ descripcion: selected.descripcion || '', estatus: String(selected.estatus ?? '1') });
    }
  }, [selected]);

  useEffect(() => { if (error) { Swal.fire('Error', error, 'error'); dispatch(clearError()); } }, [error, dispatch]);

  const handleChange = (e) => { const { name, value } = e.target; setForm((f) => ({ ...f, [name]: value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, estatus: form.estatus === '1' ? 1 : 0, categoria_id: Number(categoriaId) };
      await dispatch(updateServicio({ id, data: payload })).unwrap();
      Swal.fire({ title: 'Éxito', text: 'Servicio actualizado', icon: 'success', timer: 1500, showConfirmButton: false });
      navigate(`/catalogo-categorias/${categoriaId}/servicios`);
    } catch (err) {
      Swal.fire('Error', err || 'No se pudo actualizar', 'error');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Editar Servicio</h2>
        <p className="text-gray-600">Actualice la información del servicio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#DAC19A] to-[#B8A078] px-6 py-4 flex items-center gap-3">
            <FaCog className="text-white text-xl" />
            <h3 className="text-lg font-semibold text-white">Información del Servicio</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaCog className="text-gray-400" size={14} />
                  Descripción <span className="text-red-500">*</span>
                </label>
                <input
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#DAC19A] focus:ring-[#DAC19A]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ingrese la descripción"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="estatus" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaCog className="text-gray-400" size={14} />
                  Estatus
                </label>
                <select
                  name="estatus"
                  value={form.estatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#DAC19A] focus:ring-[#DAC19A]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900"
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
            onClick={() => navigate(`/catalogo-categorias/${categoriaId}/servicios`)}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[#DAC19A] to-[#B8A078] text-white hover:from-[#B8A078] hover:to-[#A89068] focus:outline-none focus:ring-2 focus:ring-[#DAC19A]/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServicioEdit;
