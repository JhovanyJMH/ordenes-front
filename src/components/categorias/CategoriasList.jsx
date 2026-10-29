import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategorias, deleteCategoria } from '../../features/categorias/categoriasSlice';
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiSearch } from 'react-icons/fi';

const CategoriasList = () => {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector((s) => s.categorias);
  const location = useLocation();
  const initialPage = location.state?.page || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCategorias({ page: currentPage, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#d33'
    });
    if (result.isConfirmed) {
      try {
        await dispatch(deleteCategoria(id)).unwrap();
        await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'La categoría se eliminó correctamente.' });
        dispatch(fetchCategorias({ page: currentPage, search: searchTerm }));
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: typeof e === 'string' ? e : 'No se pudo eliminar.' });
      }
    }
  };

  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-[#f1e0e1] bg-white shadow-sm">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#8A2036] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
            placeholder="Buscar por descripción..."
            className="w-full rounded-2xl border border-[#eed7d5] bg-white py-3 pl-14 pr-4 text-sm text-gray-700 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-[#8A2036] focus:outline-none focus:ring-4 focus:ring-[#8A2036]/10"
          />
        </div>
        <button
          type="submit"
          className="rounded-2xl bg-gradient-to-r from-[#8A2036] to-[#a83049] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8A2036]/20 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-[#8A2036]/25"
        >
          Buscar
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-[#f1dfe2] bg-white shadow-[0_18px_45px_rgba(138,32,54,0.08)] ring-1 ring-[#f6e4e8]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-xs sm:text-sm">
            <thead className="bg-gradient-to-r from-[#8A2036] via-[#9b2740] to-[#a9304a] text-xs font-bold uppercase tracking-[0.14em] text-white">
              <tr>
                <th className="px-3 py-3 text-left sm:px-4">ID</th>
                <th className="px-3 py-3 text-left sm:px-4">Descripción</th>
                <th className="px-3 py-3 text-left sm:px-4">Estatus</th>
                <th className="px-3 py-3 text-center sm:px-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5e4e6] bg-white">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f9e7e5] text-[#8A2036]">—</span>
                      <span>Sin categorías registradas</span>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((cat) => (
                  <tr key={cat.id} className="transition-colors duration-200 odd:bg-white even:bg-[#fffaf8] hover:bg-[#fff3f2]">
                    <td className="whitespace-nowrap px-3 py-3 font-bold text-[#2e1f22] sm:px-4">{cat.id}</td>
                    <td className="max-w-[220px] px-3 py-3 text-gray-700 sm:px-4">
                      <span className="line-clamp-2 font-medium">{cat.descripcion}</span>
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        Number(cat.estatus) === 1
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                          : 'bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200'
                      }`}>
                        {Number(cat.estatus) === 1 ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center sm:px-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          to={`editar/${cat.id}`}
                          state={{ fromPage: currentPage }}
                          title="Editar"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#BC955B]/30 bg-[#fff7f7] px-3 py-1.5 text-[11px] font-bold text-[#BC955B] transition-all duration-200 hover:bg-[#BC955B] hover:text-white hover:shadow-md hover:shadow-[#BC955B]/20"
                        >
                          Editar
                        </Link>
                        <Link
                          to={`${cat.id}/servicios`}
                          title="Servicios"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#8A2036]/30 bg-[#fff7f7] px-3 py-1.5 text-[11px] font-bold text-[#8A2036] transition-all duration-200 hover:bg-[#8A2036] hover:text-white hover:shadow-md hover:shadow-[#8A2036]/20"
                        >
                          Servicios
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#f3e3e1] bg-[#fffdfd] px-3 py-3 shadow-sm sm:flex-row sm:px-4">
        <p className="text-sm font-medium text-gray-600">
          Mostrando {pagination.from || 0} a {pagination.to || 0} de {pagination.total || 0}
        </p>
        {pagination.lastPage > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-[#e8d3d4] bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 transition hover:border-[#8A2036]/30 hover:text-[#8A2036] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
            >
              Anterior
            </button>
            {(() => {
              const pages = [];
              const pagesToShow = window.innerWidth < 640 ? 5 : 10;
              let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
              let endPage = Math.min(pagination.lastPage, startPage + pagesToShow - 1);
              if (endPage - startPage + 1 < pagesToShow) {
                startPage = Math.max(1, endPage - pagesToShow + 1);
              }
              if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) pages.push('...');
              }
              for (let i = startPage; i <= endPage; i++) pages.push(i);
              if (endPage < pagination.lastPage) {
                if (endPage < pagination.lastPage - 1) pages.push('...');
                pages.push(pagination.lastPage);
              }
              return pages.map((p, idx) => (
                typeof p === 'number' ? (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`rounded-xl px-2.5 py-1.5 text-sm font-semibold transition sm:px-3 ${
                      p === currentPage
                        ? 'bg-[#8A2036] text-white shadow-md shadow-[#8A2036]/20'
                        : 'border border-[#e8d3d4] bg-white text-gray-700 hover:border-[#8A2036]/30 hover:text-[#8A2036]'
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">{p}</span>
                )
              ));
            })()}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(pagination.lastPage, p + 1))}
              disabled={currentPage === pagination.lastPage}
              className="rounded-xl border border-[#e8d3d4] bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 transition hover:border-[#8A2036]/30 hover:text-[#8A2036] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriasList;
