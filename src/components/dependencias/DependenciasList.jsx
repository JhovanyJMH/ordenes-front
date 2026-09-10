import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDependencias, deleteDependencia } from '../../features/dependencias/dependenciasSlice';
import { Link, useLocation } from 'react-router-dom';
import { SearchBar } from '../SearchBar';
import Swal from 'sweetalert2';

const DependenciasList = () => {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector((state) => state.dependencias);
  const location = useLocation();
  const updatedIdFromState = location.state?.updatedId;
  const initialPage = location.state?.page || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState('');
  const updatedRowRef = useRef(null);

  useEffect(() => {
    dispatch(fetchDependencias({ page: currentPage, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar dependencia?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteDependencia(id)).unwrap();
        await Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La dependencia se eliminó correctamente.',
          confirmButtonColor: '#3085d6',
        });
        dispatch(fetchDependencias({ page: currentPage, search: searchTerm }));
      } catch (error) {
        console.error('Error al eliminar dependencia:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: typeof error === 'string' ? error : 'No se pudo eliminar la dependencia.',
          confirmButtonColor: '#d33',
        });
      }
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (updatedRowRef.current) {
      updatedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [list, updatedIdFromState]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-colorPrimario"></div>
      </div>
    );
  }

  return (
    <>
      <SearchBar 
        showButton={false}
        onSearch={handleSearch}
        currentPage={currentPage}
      />
      <div className="w-full overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="min-w-full text-xs sm:text-sm text-left text-gray-700">
        <thead className="text-sm sm:text-base text-white uppercase bg-colorPrimario">
          <tr>
            <th scope="col" className="py-1 sm:py-2 px-2 sm:px-4">ID</th>
            <th scope="col" className="py-1 sm:py-2 px-2 sm:px-4">Opciones</th>
            <th scope="col" className="py-1 sm:py-2 px-2 sm:px-4">Secretaría</th>
            <th scope="col" className="py-1 sm:py-2 px-2 sm:px-4">Unidad Administrativa</th>
            <th scope="col" className="py-1 sm:py-2 px-2 sm:px-4">Área</th>
          </tr>
        </thead>
        <tbody className="uppercase text-[10px] sm:text-xs">
          {list.map((dep) => {
            const isUpdated = updatedIdFromState && String(updatedIdFromState) === String(dep.id);
            return (
            <tr
              key={dep.id}
              ref={isUpdated ? updatedRowRef : null}
              className={`border-b border-colorTerciario cursor-pointer transition-colors duration-200 ${
                isUpdated
                  ? 'bg-green-100 hover:bg-green-200'
                  : 'bg-gray-50 hover:bg-orange-100'
              }`}
            >
              <td className="py-1 px-2 sm:px-4 whitespace-nowrap">{dep.id}</td>
              <th scope="row" className="flex items-center py-1 px-2 sm:px-4 space-x-2 sm:space-x-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <Link
                      to={`editar/${dep.id}`}
                      state={{ fromPage: currentPage }}
                      title="Editar"
                      className="text-[#bc955b] hover:text-white border-2 border-[#bc955b] hover:bg-[#bc955b] focus:ring-2 focus:outline-none focus:ring-[#bc955b] font-medium rounded-lg text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 text-center mr-1 sm:mr-2 mb-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 icon icon-tabler icon-tabler-pencil" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" />
                        <path d="M13.5 6.5l4 4" />
                      </svg>
                    </Link>
                    {/* <button
                      type="button"
                      onClick={() => handleDelete(dep.id)}
                      title="Eliminar"
                      className="text-red-600 hover:text-white border-2 border-red-600 hover:bg-red-600 focus:ring-2 focus:outline-none focus:ring-red-600 font-medium rounded-lg text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 text-center mr-1 sm:mr-2 mb-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 7h16" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                      </svg>
                    </button> */}
                  </div>
                </div>
              </th>
              <td className="py-1 px-2 sm:px-4 whitespace-nowrap">{dep.secretaria}</td>
              <td className="py-1 px-2 sm:px-4 whitespace-nowrap">{dep.direccion}</td>
              <td className="py-1 px-2 sm:px-4 whitespace-nowrap">{dep.oficina}</td>
            </tr>
          );})}
        </tbody>
      </table>
    </div>

      {/* Paginación y contador de resultados */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className="text-sm text-gray-600 text-center sm:text-left">
          Mostrando <span className="font-medium">{pagination.from || 0}</span> a <span className="font-medium">{pagination.to || 0}</span> de <span className="font-medium">{pagination.total || 0}</span> resultados
        </div>

        {pagination.lastPage > 1 && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={typeof page !== 'number' || currentPage === page}
                  className={`px-2 sm:px-3 py-1 rounded-md text-sm ${typeof page === 'number'
                    ? (currentPage === page
                      ? 'bg-colorPrimario text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50')
                    : 'bg-white border border-gray-300 text-gray-700 opacity-50 cursor-default'
                  }`}
                >
                  {page}
                </button>
              ));
            })()}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(pagination.lastPage, prev + 1))}
              disabled={currentPage === pagination.lastPage}
              className="px-2 sm:px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default DependenciasList;
