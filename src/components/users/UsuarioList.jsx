import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser, clearError, clearSuccessMessage, clearHighlightedUser } from '../../features/users/usersSlice';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';

const UsuarioList = () => {
  const dispatch = useDispatch();
  const { 
    list: users, 
    loading, 
    error, 
    successMessage, 
    pagination,
    highlightedUser,
    paginationInfo
  } = useSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const highlightedRowRef = useRef(null);
  const skipFetchRef = useRef(false);
  const [searchInput, setSearchInput] = useState('');

  const isHighlightedRow = (userId) =>
    highlightedUser != null && Number(highlightedUser) === Number(userId);

  useEffect(() => {
    if (!paginationInfo?.page) return;

    const targetPage = Math.max(1, Number(paginationInfo.page) || 1);

    skipFetchRef.current = true;
    setCurrentPage(targetPage);
    setSearchTerm('');
    setSearchInput('');
    dispatch(fetchUsers({ page: targetPage, search: '' }));
  }, [dispatch, paginationInfo]);

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }
    dispatch(fetchUsers({ page: currentPage, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  useEffect(() => {
    if (highlightedUser == null || loading) return;
    const exists = users.some((user) => isHighlightedRow(user.id));
    if (!exists) return;

    const scrollTimeout = setTimeout(() => {
      highlightedRowRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 150);

    const clearHighlightTimeout = setTimeout(() => {
      dispatch(clearHighlightedUser());
    }, 4000);

    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(clearHighlightTimeout);
    };
  }, [highlightedUser, dispatch, loading, users]);

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
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#8A2036',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteUser(id)).unwrap();
        await Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El usuario se eliminó correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el usuario.'
        });
      }
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const waitingForHighlightedUser =
    highlightedUser != null && !users.some((user) => isHighlightedRow(user.id));

  if (loading && (users.length === 0 || waitingForHighlightedUser)) {
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
              placeholder="Buscar por nombre o correo..."
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
        <Link
          to="registrar"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#8A2036] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8A2036]/20 transition-all duration-200 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-[#8A2036]/25"
        >
          <FiPlus size={16} />
          Nuevo Usuario
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#f1dfe2] bg-white shadow-[0_18px_45px_rgba(138,32,54,0.08)] ring-1 ring-[#f6e4e8]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-xs sm:text-sm">
            <thead className="bg-[#8A2036] text-xs font-bold uppercase tracking-[0.14em] text-white">
              <tr>
                <th className="px-3 py-3 text-left sm:px-4">ID</th>
                <th className="px-3 py-3 text-center sm:px-4">Acción</th>
                <th className="px-3 py-3 text-left sm:px-4">Nombre</th>
                <th className="px-3 py-3 text-left sm:px-4">Correo Electrónico</th>
                <th className="px-3 py-3 text-left sm:px-4">Perfil</th>
                <th className="px-3 py-3 text-left sm:px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5e4e6] bg-white">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f9e7e5] text-[#8A2036]">—</span>
                      <span>Sin usuarios registrados</span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    ref={isHighlightedRow(user.id) ? highlightedRowRef : null}
                    className={`transition-colors duration-200 ${
                      isHighlightedRow(user.id)
                        ? 'bg-[#8A2036] text-white shadow-md'
                        : 'odd:bg-white even:bg-[#f5edd8] hover:bg-[#efe4c5]'
                    }`}
                  >
                    <td className={`whitespace-nowrap px-3 py-3 font-bold sm:px-4 ${isHighlightedRow(user.id) ? 'text-white' : 'text-[#2e1f22]'}`}>{user.id}</td>
                    <td className="px-3 py-3 text-center sm:px-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          to={`editar/${user.id}`}
                          title="Editar"
                          className="inline-flex items-center justify-center rounded-xl border border-[#BC955B]/30 bg-[#fff7f7] p-2 text-[#BC955B] transition-all duration-200 hover:bg-[#BC955B] hover:text-white hover:shadow-md hover:shadow-[#BC955B]/20"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
                            <path d="M13.5 6.5l4 4"></path>
                          </svg>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          title="Eliminar"
                          className="inline-flex items-center justify-center rounded-xl border border-[#8A2036]/30 bg-[#fff7f7] p-2 text-[#8A2036] transition-all duration-200 hover:bg-[#8A2036] hover:text-white hover:shadow-md hover:shadow-[#8A2036]/20"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td className={`max-w-[220px] px-3 py-3 sm:px-4 ${isHighlightedRow(user.id) ? 'text-white' : 'text-gray-700'}`}>
                      <span className="line-clamp-2 font-medium">{user.nombre_completo || '—'}</span>
                    </td>
                    <td className={`max-w-[200px] px-3 py-3 sm:px-4 ${isHighlightedRow(user.id) ? 'text-white/95' : 'text-gray-700'}`}>
                      <span className="line-clamp-2 lowercase">{user.email || '—'}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-700 sm:px-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        user.profile === '1'
                          ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200'
                          : user.profile === '2'
                          ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                          : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200'
                      }`}>
                        {user.profile === '1' ? 'ADMINISTRADOR' : user.profile === '2' ? 'OPERATIVO' : user.profile === '3' ? 'GENERAL' : user.profile || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        user.status
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                          : 'bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200'
                      }`}>
                        {user.status ? 'ACTIVO' : 'INACTIVO'}
                      </span>
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
          Mostrando <span className="font-bold text-[#8A2036]">{pagination.from || 0}</span> a <span className="font-bold text-[#8A2036]">{pagination.to || 0}</span> de <span className="font-bold text-[#8A2036]">{pagination.total || 0}</span>
          {searchTerm && (
            <span className="ml-2 text-xs text-gray-500">(filtrando: "{searchTerm}")</span>
          )}
        </p>
        {pagination.lastPage > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
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
                if (startPage > 2) {
                  pages.push('...');
                }
              }
              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }
              if (endPage < pagination.lastPage) {
                if (endPage < pagination.lastPage - 1) {
                  pages.push('...');
                }
                pages.push(pagination.lastPage);
              }
              return pages.map((page, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={typeof page !== 'number' || currentPage === page}
                  className={`rounded-xl px-2.5 py-1.5 text-sm font-semibold transition sm:px-3 ${
                    typeof page === 'number'
                      ? currentPage === page
                        ? 'bg-[#8A2036] text-white shadow-md shadow-[#8A2036]/20'
                        : 'border border-[#e8d3d4] bg-white text-gray-700 hover:border-[#8A2036]/30 hover:text-[#8A2036]'
                      : 'cursor-default border border-transparent bg-transparent text-gray-400'
                  }`}
                >
                  {page}
                </button>
              ));
            })()}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
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

export default UsuarioList;