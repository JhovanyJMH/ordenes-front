import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRefaccionById, updateRefaccion, clearError } from '../../features/refacciones/refaccionesSlice';
import { useNavigate, useParams } from 'react-router-dom';
import SearchModal from '../common/SearchModal';
import Swal from 'sweetalert2';
import refaccionesService from '../../services/refaccionesService';
import { FaWrench } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';

const RefaccionEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selected, loading } = useSelector((s) => s.refacciones);

  const [form, setForm] = useState({
    descripcion: '',
    estatus: '1',
  });

  const [selectedLabel, setSelectedLabel] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { dispatch(getRefaccionById(id)); }, [dispatch, id]);

  useEffect(() => {
    if (selected) {
      setForm({
        descripcion: selected.descripcion || '',
        estatus: selected.estatus || '1',
      });
      setSelectedLabel(selected.descripcion || '');
    }
  }, [selected]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSearchSelectChange = (option) => {
    setForm((f) => ({ ...f, descripcion: option?.label || '' }));
    setSelectedLabel(option?.label || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateRefaccion({ id, data: form })).unwrap();
      Swal.fire({ title: 'Éxito', text: 'Refacción actualizada', icon: 'success', timer: 1500, showConfirmButton: false });
      navigate('/catalogo-refacciones');
    } catch (err) {
      Swal.fire('Error', err || 'No se pudo actualizar', 'error');
      dispatch(clearError());
    }
  };

  if (!selected && loading) {
    return <div className="flex justify-center h-32 items-center"><div className="animate-spin h-10 w-10 border-4 border-[#BC955B] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Editar Refacción</h2>
        <p className="text-gray-600">Actualice la información de la refacción</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#BC955B] to-[#9A7A4A] px-6 py-4 flex items-center gap-3">
            <FaWrench className="text-white text-xl" />
            <h3 className="text-lg font-semibold text-white">Información de la Refacción</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaWrench className="text-gray-400" size={14} />
                  Descripción <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#BC955B] focus:ring-[#BC955B]/20 focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400 pr-12"
                    placeholder="Ingrese la descripción"
                  />
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
                  >
                    <FiSearch size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="estatus" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FaWrench className="text-gray-400" size={14} />
                  Estatus
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
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/catalogo-refacciones')}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[#BC955B] to-[#9A7A4A] text-white hover:from-[#9A7A4A] hover:to-[#8A6A3A] focus:outline-none focus:ring-2 focus:ring-[#BC955B]/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar Cambios
          </button>
        </div>
      </form>

      <SearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Buscar refacción"
        searchFunction={refaccionesService.filtrado}
        onSelect={handleSearchSelectChange}
        labelField="descripcion"
      />
    </div>
  );
};

export default RefaccionEdit;
