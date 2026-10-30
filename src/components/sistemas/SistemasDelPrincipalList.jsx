import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiArrowLeft, FiEdit2, FiPlus, FiSearch } from 'react-icons/fi';
import { fetchSistemas, clearError, clearSuccessMessage, clearHighlightedSistema } from '../../features/sistemas/sistemasSlice';
import sistemasPrincipalesService from '../../services/sistemasPrincipalesService';
import Pagination from '../common/Pagination';

const SistemasDelPrincipalList = () => {
  const { sistemaPrincipalId } = useParams();
  const dispatch = useDispatch();
  const { 
    list, 
    loading, 
    error, 
    successMessage, 
    pagination,
    highlightedSistema,
    paginationInfo
  } = useSelector((s) => s.sistemas);
  const [sistemaPrincipal, setSistemaPrincipal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const highlightedRowRef = useRef(null);
  const skipFetchRef = useRef(false);

  const isHighlightedRow = (id) =>
    highlightedSistema != null && Number(highlightedSistema) === Number(id);

  useEffect(() => {
    let cancelled = false;
    sistemasPrincipalesService.getSistemaPrincipalById(sistemaPrincipalId)
      .then((principal) => {
        if (!cancelled) setSistemaPrincipal(principal);
      })
      .catch((error) => {
        if (!cancelled) {
          Swal.fire({ icon: 'error', title: 'No se pudo cargar el sistema', text: error.response?.data?.message || 'Intenta nuevamente.' });
        }
      });
    return () => { cancelled = true; };
  }, [sistemaPrincipalId]);

  useEffect(() => {
    if (!paginationInfo?.page) return;
    const targetPage = Math.max(1, Number(paginationInfo.page) || 1);
    skipFetchRef.current = true;
    setCurrentPage(targetPage);
    setSearchTerm('');
    setSearchInput('');
    dispatch(fetchSistemas({ page: targetPage, search: '', sistema_principal_id: sistemaPrincipalId }));
  }, [dispatch, paginationInfo, sistemaPrincipalId]);

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }
    dispatch(fetchSistemas({ page: currentPage, search: searchTerm, sistema_principal_id: sistemaPrincipalId }));
  }, [dispatch, currentPage, searchTerm, sistemaPrincipalId]);

  useEffect(() => {
    if (highlightedSistema == null || loading) return;
    const exists = list.some((item) => isHighlightedRow(item.id));
    if (!exists) return;

    const scrollTimeout = setTimeout(() => {
      highlightedRowRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 150);

    const clearHighlightTimeout = setTimeout(() => {
      dispatch(clearHighlightedSistema());
    }, 4000);

    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(clearHighlightTimeout);
    };
  }, [highlightedSistema, dispatch, loading, list]);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const waitingForHighlighted = highlightedSistema != null && !list.some((item) => isHighlightedRow(item.id));

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
        <div>
          <h2 className="text-2xl font-bold text-[#8A2036]">{sistemaPrincipal?.descripcion || 'Sistema principal'}</h2>
          <p className="text-sm text-gray-600">Sistemas, versiones y variantes registrados dentro del sistema principal.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/catalogo-sistemas" className="inline-flex items-center gap-2 rounded-xl border border-[#e8d3d4] bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-[#8A2036]/30 hover:text-[#8A2036]">
            <FiArrowLeft size={16} /> Sistemas
          </Link>
          <Link to="registrar" className="inline-flex items-center gap-2 rounded-2xl bg-[#8A2036] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8A2036]/20 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-[#8A2036]/25">
            <FiPlus size={16} /> Agregar Sistema
          </Link>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
            placeholder="Buscar por nombre, siglas o versión..."
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

      <div className="overflow-hidden rounded-2xl border border-[#f1dfe2] bg-white shadow-[0_18px_45px_rgba(138,32,54,0.08)] ring-1 ring-[#f6e4e8]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-xs sm:text-sm">
            <thead className="bg-[#8A2036] text-xs font-bold uppercase tracking-[0.14em] text-white">
              <tr>
                <th className="px-3 py-3 text-left sm:px-4">Sistema / Variante</th>
                <th className="px-3 py-3 text-center sm:px-4">Acción</th>
                <th className="px-3 py-3 text-left sm:px-4">Versión</th>
                <th className="px-3 py-3 text-left sm:px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5e4e6] bg-white">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f9e7e5] text-[#8A2036]">—</span>
                      <span>Sin sistemas registrados</span>
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
                    <td className={`max-w-[220px] px-3 py-3 text-gray-700 sm:px-4 ${isHighlightedRow(item.id) ? 'text-white/95' : ''}`}>
                      <span className="line-clamp-2 font-bold">{item.siglas || item.nombre}</span>
                      <div className="text-xs text-gray-500">{item.nombre}</div>
                    </td>
                    <td className="px-3 py-3 text-center sm:px-4">
                      <Link
                        title="Editar sistema"
                        to={`editar/${item.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-[#BC955B]/30 bg-[#fff7f7] p-2 text-[#BC955B] transition-all duration-200 hover:bg-[#BC955B] hover:text-white hover:shadow-md hover:shadow-[#BC955B]/20"
                      >
                        <FiEdit2 size={16} />
                      </Link>
                    </td>
                    <td className={`whitespace-nowrap px-3 py-3 text-gray-700 sm:px-4 ${isHighlightedRow(item.id) ? 'text-white/95' : ''}`}>{item.version || 'Sin versión'}</td>
                    <td className={`whitespace-nowrap px-3 py-3 text-gray-700 sm:px-4 ${isHighlightedRow(item.id) ? 'text-white/95' : ''}`}>{item.estado_operativo || 'Sin estado'}</td>
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

export default SistemasDelPrincipalList;
