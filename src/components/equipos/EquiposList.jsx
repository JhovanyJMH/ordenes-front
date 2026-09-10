import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEquipos, deleteEquipo } from '../../features/equipos/equiposSlice';
import { Link } from 'react-router-dom';
import { SearchBar } from '../SearchBar';
import Swal from 'sweetalert2';

const EquiposList = () => {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector((s) => s.equipos);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchEquipos({ page: currentPage, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar equipo?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteEquipo(id)).unwrap();
        await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El equipo se eliminó correctamente.' });
        dispatch(fetchEquipos({ page: currentPage, search: searchTerm }));
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: typeof e === 'string' ? e : 'No se pudo eliminar.' });
      }
    }
  };

  const handleSearch = (term) => { setSearchTerm(term); setCurrentPage(1); };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-colorPrimario" />
      </div>
    );
  }

  return (
    <>
      <SearchBar showButton={false} onSearch={handleSearch} currentPage={currentPage} />
      <div className="w-full overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="min-w-full text-xs sm:text-sm text-left text-gray-700">
          <thead className="text-sm sm:text-base text-white uppercase bg-colorPrimario">
            <tr>
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Opciones</th>
              <th className="py-2 px-4">Inventario</th>
              <th className="py-2 px-4">Descripción</th>
              <th className="py-2 px-4">Marca</th>
              <th className="py-2 px-4">Modelo</th>
              <th className="py-2 px-4">Serie</th>
              <th className="py-2 px-4">Ubicación</th>
              <th className="py-2 px-4">Estatus</th>
            </tr>
          </thead>
          <tbody className="text-[10px] sm:text-xs">
            {list.map((item) => (
              <tr key={item.id} className="border-b border-colorTerciario bg-gray-50 hover:bg-orange-100">
                <td className="py-2 px-4 whitespace-nowrap">{item.id}</td>
                <td className="py-2 px-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Link to={`editar/${item.id}`} className="text-[#bc955b] hover:text-white border-2 border-[#bc955b] hover:bg-[#bc955b] font-medium rounded-lg px-3 py-2 text-xs">Editar</Link>
                    {/* <button type="button" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-white border-2 border-red-600 hover:bg-red-600 font-medium rounded-lg px-3 py-2 text-xs">Eliminar</button> */}
                  </div>
                </td>
                <td className="py-2 px-4 whitespace-nowrap font-mono">{item.inventario}</td>
                <td className="py-2 px-4">{item.descripcion}</td>
                <td className="py-2 px-4 whitespace-nowrap">{item.marca}</td>
                <td className="py-2 px-4 whitespace-nowrap">{item.modelo}</td>
                <td className="py-2 px-4 whitespace-nowrap">{item.serie}</td>
                <td className="py-2 px-4">{item.ubicacion}</td>
                <td className="py-2 px-4 whitespace-nowrap">{item.estatus === '1' ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className="text-sm text-gray-600 text-center sm:text-left">
          Mostrando <span className="font-medium">{pagination.from || 0}</span> a <span className="font-medium">{pagination.to || 0}</span> de <span className="font-medium">{pagination.total || 0}</span> resultados
        </div>
        {pagination.lastPage > 1 && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={typeof page !== 'number' || currentPage === page}
                  className={`px-2 sm:px-3 py-1 rounded-md text-sm ${typeof page === 'number' ?
                    (currentPage === page
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
              onClick={() => handlePageChange(currentPage + 1)}
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

export default EquiposList;
