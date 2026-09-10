import { useState, useEffect } from 'react';
import CustomSelect from './CustomSelect';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';

const SearchModal = ({ isOpen, onClose, title, searchFunction, onSelect, labelField = 'label', labelFormatter = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Resetear estado cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setOptions([]);
      setSelectedValue(null);
      setHasSearched(false);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await searchFunction(searchTerm);
      if (response.status === 'success') {
        const dataKey = Object.keys(response).find(key => key !== 'status');
        const items = response[dataKey] || [];
        setOptions(items.map(item => ({
          value: item.id,
          label: labelFormatter 
            ? labelFormatter(item) 
            : (item[labelField] || item.descripcion || item.nombre || `${item.id}`),
        })));
      }
    } catch (error) {
      console.error('Error searching:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option) => {
    setSelectedValue(option);
    onSelect(option);
    onClose();
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value.toUpperCase());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-colorPrimario/10 text-colorPrimario">
              <FiSearch size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-gray-700">Término de búsqueda</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Escribe para buscar..."
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm uppercase focus:border-colorPrimario focus:outline-none focus:ring-2 focus:ring-colorPrimario/20 transition-all"
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="rounded-xl bg-colorPrimario px-5 py-3 text-white hover:bg-colorPrimario/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader size={18} className="animate-spin" />
                  <span>Buscando</span>
                </>
              ) : (
                <>
                  <FiSearch size={18} />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {options.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Resultados encontrados <span className="text-colorPrimario">({options.length})</span>
            </label>
            <CustomSelect
              variant="boxed"
              options={options}
              value={selectedValue}
              onChange={handleSelect}
              placeholder="Selecciona una opción..."
              isClearable
            />
          </div>
        )}

        {hasSearched && options.length === 0 && !loading && (
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center animate-in fade-in duration-300">
            <FiSearch size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-500">No se encontraron resultados</p>
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
            <FiSearch size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-500">Escribe un término para buscar</p>
            <p className="text-xs text-gray-400 mt-1">Usa el campo de arriba para iniciar la búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
