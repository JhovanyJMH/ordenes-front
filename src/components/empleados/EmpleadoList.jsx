import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmpleados, deleteEmpleado, clearError, clearSuccessMessage } from '../../features/empleados/empleadosSlice';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { SearchBar } from '../SearchBar';

const EmpleadoList = () => {
  const dispatch = useDispatch();
  const { list: empleados, loading, error, successMessage, pagination } = useSelector((s) => s.empleados);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchEmpleados({ page: currentPage, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  useEffect(() => {
    if (error) {
      Swal.fire({ title: 'Error', text: error, icon: 'error' });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      Swal.fire({ title: '¡Éxito!', text: successMessage, icon: 'success', timer: 2000, showConfirmButton: false });
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el empleado. Esta operación no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      dispatch(deleteEmpleado(id));
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

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
        searchPath="/get-search-empleados"
        normalPath="/get-empleados"
        showButton={false}
        onSearch={handleSearch}
      />
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-base text-white uppercase bg-colorPrimario">
            <tr>
              <th scope="col" className="py-2 px-4">ID</th>
              <th scope="col" className="py-2 px-4">Opciones</th>
              <th scope="col" className="py-2 px-4">Nombre</th>
              <th scope="col" className="py-2 px-4">Clave</th>
              <th scope="col" className="py-2 px-4">Puesto</th>
              <th scope="col" className="py-2 px-4">Correo</th>
              <th scope="col" className="py-2 px-4">Estatus</th>
            </tr>
          </thead>
          <tbody className={`${loading ? 'hidden' : ''} uppercase text-xs`}>
            {empleados.map((emp) => (
              <tr key={emp.id} className={`border-b bg-gray-50 hover:bg-orange-100 transition-all duration-300 border-colorTerciario`}>
                <td className="py-1 px-4">{emp.id}</td>
                <th scope="row" className="flex items-center py-1 px-4 space-x-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <Link
                        to={`editar/${emp.id}`}
                        title="Editar"
                        className="text-[#bc955b] hover:text-white border-2 border-[#bc955b] hover:bg-[#bc955b] focus:ring-2 focus:outline-none focus:ring-[#bc955b] font-medium rounded-lg text-sm px-3 py-2.5 text-center mr-2 mb-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 icon icon-tabler icon-tabler-pencil" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
                          <path d="M13.5 6.5l4 4"></path>
                        </svg>
                      </Link>
                      {/* <button
                        onClick={() => handleDelete(emp.id)}
                        title="Eliminar"
                        className="text-colorPrimario bg-white border-2 border-colorPrimario hover:bg-colorPrimario hover:text-white focus:ring-2 focus:outline-none focus:ring-colorPrimario font-medium rounded-lg text-sm px-3 py-2.5 text-center mb-2 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 icon icon-tabler icon-tabler-trash" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M4 7h16"></path>
                          <path d="M10 11v6"></path>
                          <path d="M14 11v6"></path>
                          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
                          <path d="M9 7V4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
                        </svg>
                      </button> */}
                    </div>
                  </div>
                </th>
                <td className="py-1 px-4">{emp.nombre} {emp.apellidos}</td>
                <td className="py-1 px-4">{emp.clave}</td>
                <td className="py-1 px-4">{emp.puesto}</td>
                <td className="py-1 px-4 lowercase">{emp.email}</td>
                <td className="py-1 px-4">{Number(emp.estatus) === 1 ? 'ACTIVO' : 'INACTIVO'}</td>
              </tr>
            ))}
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
              onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="px-2 sm:px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Anterior
            </button>

            {(() => {
              const pages = [];
              const pagesToShow = window.innerWidth < 640 ? 5 : 10;
              let startPage = Math.max(1, pagination.currentPage - Math.floor(pagesToShow / 2));
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

              return pages.map((p, idx) => (
                typeof p === 'number' ? (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-2 sm:px-3 py-1 rounded-md border text-sm ${
                      p === pagination.currentPage
                        ? 'bg-colorPrimario text-white border-colorPrimario'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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
              onClick={() => handlePageChange(Math.min(pagination.lastPage, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.lastPage}
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

export default EmpleadoList;
