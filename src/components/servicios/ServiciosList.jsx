import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServicios, deleteServicio } from '../../features/servicios/serviciosSlice';
import { Link, useParams, useLocation } from 'react-router-dom';
import { SearchBar } from '../SearchBar';
import Swal from 'sweetalert2';

const ServiciosList = () => {
  const dispatch = useDispatch();
  const { categoriaId } = useParams();
  const { list, loading, pagination } = useSelector((s) => s.servicios);
  const location = useLocation();
  const initialPage = location.state?.page || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchServicios({ page: currentPage, search: searchTerm, categoria_id: categoriaId }));
  }, [dispatch, currentPage, searchTerm, categoriaId]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: '¿Eliminar servicio?', text: 'Esta acción no se puede deshacer.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#d33' });
    if (result.isConfirmed) {
      try {
        await dispatch(deleteServicio(id)).unwrap();
        await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El servicio se eliminó correctamente.' });
        dispatch(fetchServicios({ page: currentPage, search: searchTerm, categoria_id: categoriaId }));
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: typeof e === 'string' ? e : 'No se pudo eliminar.' });
      }
    }
  };

  const handleSearch = (term) => { setSearchTerm(term); setCurrentPage(1); };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-colorPrimario"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-colorPrimario">Servicios de la categoría #{categoriaId}</h2>
        <Link to={`/catalogo-categorias`} className="text-sm text-colorPrimario underline">Volver a categorías</Link>
      </div>
      <SearchBar showButton={false} onSearch={handleSearch} currentPage={currentPage} />
      <div className="w-full overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="min-w-full text-xs sm:text-sm text-left text-gray-700">
          <thead className="text-sm sm:text-base text-white uppercase bg-colorPrimario">
            <tr>
              <th className="py-1 sm:py-2 px-2 sm:px-4">ID</th>
              <th className="py-1 sm:py-2 px-2 sm:px-4">Opciones</th>
              <th className="py-1 sm:py-2 px-2 sm:px-4">Descripción</th>
              <th className="py-1 sm:py-2 px-2 sm:px-4">Estatus</th>
            </tr>
          </thead>
          <tbody className="uppercase text-[10px] sm:text-xs">
            {list.map((srv) => (
              <tr key={srv.id} className="border-b border-colorTerciario bg-gray-50 hover:bg-orange-100">
                <td className="py-1 px-2 sm:px-4 whitespace-nowrap">{srv.id}</td>
                <th scope="row" className="flex items-center py-1 px-2 sm:px-4 space-x-2 sm:space-x-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <Link to={`editar/${srv.id}`} state={{ fromPage: currentPage }} title="Editar" className="text-[#bc955b] hover:text-white border-2 border-[#bc955b] hover:bg-[#bc955b] focus:ring-2 focus:outline-none focus:ring-[#bc955b] font-medium rounded-lg text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 text-center mr-1 sm:mr-2 mb-2">Editar</Link>
                      {/* <button onClick={() => handleDelete(srv.id)} title="Eliminar" className="text-red-600 hover:text-white border-2 border-red-600 hover:bg-red-600 focus:ring-2 focus:outline-none focus:ring-red-600 font-medium rounded-lg text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 text-center mr-1 sm:mr-2 mb-2">Eliminar</button> */}
                    </div>
                  </div>
                </th>
                <td className="py-1 px-2 sm:px-4 whitespace-nowrap">{srv.descripcion}</td>
                <td className="py-1 px-2 sm:px-4 whitespace-nowrap">{Number(srv.estatus) === 1 ? 'ACTIVO' : 'INACTIVO'}</td>
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
            <button onClick={() => setCurrentPage((p)=> Math.max(1, p-1))} disabled={currentPage===1} className="px-2 sm:px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm">Anterior</button>
            {(() => {
              const pages = [];
              const pagesToShow = window.innerWidth < 640 ? 5 : 10;
              let startPage = Math.max(1, currentPage - Math.floor(pagesToShow/2));
              let endPage = Math.min(pagination.lastPage, startPage + pagesToShow - 1);
              if (endPage - startPage + 1 < pagesToShow) {
                startPage = Math.max(1, endPage - pagesToShow + 1);
              }
              if (startPage > 1) { pages.push(1); if (startPage > 2) pages.push('...'); }
              for (let i = startPage; i <= endPage; i++) pages.push(i);
              if (endPage < pagination.lastPage) { if (endPage < pagination.lastPage - 1) pages.push('...'); pages.push(pagination.lastPage); }
              return pages.map((p, idx) => (typeof p === 'number'
                ? <button key={p} onClick={() => setCurrentPage(p)} className={`px-2 sm:px-3 py-1 rounded-md border text-sm ${p===currentPage ? 'bg-colorPrimario text-white border-colorPrimario' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{p}</button>
                : <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">{p}</span>
              ));
            })()}
            <button onClick={() => setCurrentPage((p)=> Math.min(pagination.lastPage, p+1))} disabled={currentPage===pagination.lastPage} className="px-2 sm:px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm">Siguiente</button>
          </div>
        )}
      </div>
    </>
  );
};

export default ServiciosList;
