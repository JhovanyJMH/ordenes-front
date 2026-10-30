import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSistemasPrincipales, deleteSistemaPrincipal, clearError, clearSuccessMessage, clearHighlightedSistemaPrincipal } from '../../features/sistemasPrincipales/sistemasPrincipalesSlice';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiSearch, FiPlus, FiLayers, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Pagination from '../common/Pagination';
import SistemasExport from './SistemasExport';

const SistemasList = () => {
  const dispatch = useDispatch();
  const { 
    list, 
    loading, 
    error, 
    successMessage, 
    pagination,
    highlightedSistemaPrincipal,
    paginationInfo
  } = useSelector((s) => s.sistemasPrincipales);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sistemasData, setSistemasData] = useState([]);
  const highlightedRowRef = useRef(null);
  const skipFetchRef = useRef(false);

  const isHighlightedRow = (id) =>
    highlightedSistemaPrincipal != null && Number(highlightedSistemaPrincipal) === Number(id);

  useEffect(() => {
    if (!paginationInfo?.page) return;
    const targetPage = Math.max(1, Number(paginationInfo.page) || 1);
    skipFetchRef.current = true;
    setCurrentPage(targetPage);
    setSearchTerm('');
    setSearchInput('');
    dispatch(fetchSistemasPrincipales({ page: targetPage, search: '' }));
  }, [dispatch, paginationInfo]);

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }
    dispatch(fetchSistemasPrincipales({ page: currentPage, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  useEffect(() => {
    if (highlightedSistemaPrincipal == null || loading) return;
    const exists = list.some((item) => isHighlightedRow(item.id));
    if (!exists) return;

    const scrollTimeout = setTimeout(() => {
      highlightedRowRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 150);

    const clearHighlightTimeout = setTimeout(() => {
      dispatch(clearHighlightedSistemaPrincipal());
    }, 4000);

    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(clearHighlightTimeout);
    };
  }, [highlightedSistemaPrincipal, dispatch, loading, list]);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar sistema principal?',
      text: 'Solo se puede eliminar si no tiene sistemas o versiones registrados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#8A2036',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteSistemaPrincipal(id)).unwrap();
        await Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El sistema principal se eliminó correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err || 'No se pudo eliminar el sistema principal.'
        });
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const loadSistemasForExport = async () => {
    if (sistemasData.length > 0) return sistemasData;
    try {
      const sistemasService = (await import('../../services/sistemasService')).default;
      const data = await sistemasService.getReporte();
      setSistemasData(data);
      return data;
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar los datos', text: error.response?.data?.message || 'Intenta nuevamente.' });
      return [];
    }
  };

  const waitingForHighlighted = highlightedSistemaPrincipal != null && !list.some((item) => isHighlightedRow(item.id));

  if (loading && (list.length === 0 || waitingForHighlighted)) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-[#f1e0e1] bg-white shadow-sm">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#8A2036] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          <span className="text-red-600">⚠</span>
          {error}
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <span className="text-emerald-600">✓</span>
          {successMessage}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6e8df] text-[#8A2036] shadow-sm ring-1 ring-[#f3d2c6]">
                <FiSearch size={16} />
              </span>
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar sistema principal..."
              className="w-full rounded-2xl border border-[#eed7d5] bg-white py-3 pl-14 pr-4 text-sm text-gray-700 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-[#8A2036] focus:outline-none focus:ring-4 focus:ring-[#8A2036]/10"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-[#8A2036] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8A2036]/20 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-[#8A2036]/25"
          >
            Buscar
          </button>
        </form>
        <div className="flex gap-2">
          <SistemasExport sistemas={sistemasData} onLoad={loadSistemasForExport} />
          <Link
            to="registrar"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#8A2036] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8A2036]/20 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-[#8A2036]/25"
          >
            <FiPlus size={16} />
            Nuevo Sistema Principal
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#f1dfe2] bg-white shadow-[0_18px_45px_rgba(138,32,54,0.08)] ring-1 ring-[#f6e4e8]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-xs sm:text-sm">
            <thead className="bg-[#8A2036] text-xs font-bold uppercase tracking-[0.14em] text-white">
              <tr>
                <th className="px-3 py-3 text-left sm:px-4">ID</th>
                <th className="px-3 py-3 text-center sm:px-4">Acción</th>
                <th className="px-3 py-3 text-left sm:px-4">Sistema Principal</th>
                <th className="px-3 py-3 text-left sm:px-4">Sistemas / Versiones</th>
                <th className="px-3 py-3 text-left sm:px-4">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5e4e6] bg-white">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f9e7e5] text-[#8A2036]">—</span>
                      <span>Sin sistemas principales registrados</span>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr
                    key={item.id}
                    ref={isHighlightedRow(item.id) ? highlightedRowRef : null}
                    className={`transition-colors duration-200 ${
                      isHighlightedRow(item.id)
                        ? 'bg-[#8A2036] text-white shadow-md'
                        : 'odd:bg-white even:bg-[#f5edd8] hover:bg-[#efe4c5]'
                    }`}
                  >
                    <td className={`whitespace-nowrap px-3 py-3 font-bold sm:px-4 ${isHighlightedRow(item.id) ? 'text-white' : 'text-[#2e1f22]'}`}>{item.id}</td>
                    <td className="px-3 py-3 text-center sm:px-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          title="Administrar sistemas y versiones"
                          to={`${item.id}/sistemas`}
                          className="inline-flex items-center justify-center rounded-xl border border-[#BC955B]/30 bg-[#fff7f7] p-2 text-[#BC955B] transition-all duration-200 hover:bg-[#BC955B] hover:text-white hover:shadow-md hover:shadow-[#BC955B]/20"
                        >
                          <FiLayers size={16} />
                        </Link>
                        <Link
                          title="Editar sistema principal"
                          to={`editar/${item.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-[#BC955B]/30 bg-[#fff7f7] p-2 text-[#BC955B] transition-all duration-200 hover:bg-[#BC955B] hover:text-white hover:shadow-md hover:shadow-[#BC955B]/20"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        {/* <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          title="Eliminar sistema principal"
                          className="inline-flex items-center justify-center rounded-xl border border-[#8A2036]/30 bg-[#fff7f7] p-2 text-[#8A2036] transition-all duration-200 hover:bg-[#8A2036] hover:text-white hover:shadow-md hover:shadow-[#8A2036]/20"
                        >
                          <FiTrash2 size={16} />
                        </button> */}
                      </div>
                    </td>
                    <td className={`max-w-[220px] px-3 py-3 text-gray-700 sm:px-4 ${isHighlightedRow(item.id) ? 'text-white/95' : ''}`}>
                      <span className="line-clamp-2 font-medium">{item.descripcion}</span>
                    </td>
                    <td className={`whitespace-nowrap px-3 py-3 text-gray-700 sm:px-4 ${isHighlightedRow(item.id) ? 'text-white/95' : ''}`}>{item.sistemas_count}</td>
                    <td className="px-3 py-3 sm:px-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        Number(item.estatus) === 1
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                          : 'bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200'
                      }`}>
                        {Number(item.estatus) === 1 ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        lastPage={pagination?.lastPage || 1}
        from={pagination?.from}
        to={pagination?.to}
        total={pagination?.total}
        loading={loading}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default SistemasList;
