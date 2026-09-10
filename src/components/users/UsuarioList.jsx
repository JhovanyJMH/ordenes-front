import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser, clearError, clearSuccessMessage, clearHighlightedUser } from '../../features/users/usersSlice';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { SearchBar } from '../SearchBar';

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
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const highlightedRowRef = useRef(null);

  // Efecto para manejar la navegación y carga de datos
  useEffect(() => {
    // Si hay información de paginación del backend y no hemos navegado aún
    if (paginationInfo && !hasNavigated) {
      setCurrentPage(paginationInfo.page);
      setSearchTerm(''); // Resetear búsqueda si es necesario
      setHasNavigated(true);
      dispatch(fetchUsers({ page: paginationInfo.page, search: '' }));
    } else {
      // Para navegación manual o carga inicial
      dispatch(fetchUsers({ page: currentPage, search: searchTerm }));
    }
  }, [dispatch, currentPage, searchTerm, paginationInfo, hasNavigated]);

  // Efecto para la animación de parpadeo y scroll
  useEffect(() => {
    if (highlightedUser) {
      setIsHighlighted(true);
      
      // Scroll suave hacia el elemento destacado después de que se renderice
      setTimeout(() => {
        if (highlightedRowRef.current) {
          highlightedRowRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 500);

    // const interval = setInterval(() => {
    //   setIsHighlighted(prev => !prev);
    // }, 1000); // Parpadeo cada segundo

      // Limpiar el resaltado después de 5 segundos
     //const clearHighlightTimeout = setTimeout(() => {
     //  console.log('Limpiando usuario destacado después de 5 segundos');
     //  dispatch(clearHighlightedUser());
     //}, 5000);

      return () => {
    //    clearInterval(interval);
       // clearTimeout(clearHighlightTimeout);
        setIsHighlighted(false);
      };
    }
  }, [highlightedUser, dispatch]);

  // Limpiar mensajes después de 5 segundos
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
      title: '¿Estás seguro?',
      text: "Esta acción eliminará el usuario. Esta operación no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      dispatch(deleteUser(id));
     
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Resetear a la primera página al buscar
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
        searchPath="/get-search-users"
        normalPath="/get-users"
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
              <th scope="col" className="py-2 px-4">Correo Electrónico</th>
              <th scope="col" className="py-2 px-4">Perfil</th>
              <th scope="col" className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody className={`${loading ? 'hidden' : ''} uppercase text-xs`}>
            {users.map((user) => (
              <tr
                key={user.id}
                ref={highlightedUser === user.id ? highlightedRowRef : null}
                className={`border-b cursor-pointer transition-all duration-300 ${
                  highlightedUser === user.id 
                    ? isHighlighted 
                      ? 'bg-orange-300 shadow-lg transform scale-[1.02]' 
                      : 'bg-orange-200 shadow-md'
                    : 'bg-gray-50 hover:bg-orange-100'
                } border-colorTerciario`}
              >
                  <td className="py-1 px-4">{user.id}</td>
                <th scope="row" className="flex items-center py-1 px-4 space-x-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <Link
                        to={`editar/${user.id}`}
                        title="Editar"
                        className="text-[#bc955b] hover:text-white border-2 border-[#bc955b] hover:bg-[#bc955b] focus:ring-2 focus:outline-none focus:ring-[#bc955b] font-medium rounded-lg text-sm px-3 py-2.5 text-center mr-2 mb-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 icon icon-tabler icon-tabler-pencil" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
                          <path d="M13.5 6.5l4 4"></path>
                        </svg>
                      </Link>
                      {/* <button
                        onClick={() => handleDelete(user.id)}
                        title="Eliminar"
                        className="text-colorPrimario bg-white border-2 border-colorPrimario hover:bg-colorPrimario hover:text-white focus:ring-2 focus:outline-none focus:ring-colorPrimario font-medium rounded-lg text-sm px-3 py-2.5 text-center mb-2 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 icon icon-tabler icon-tabler-trash" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
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
                <td className="py-1 px-4">{user.nombre_completo}</td>
                <td className="py-1 px-4 lowercase">{user.email}</td>
                <td className="py-1 px-4">
                  {user.profile === '1' ? 'ADMINISTRADOR' : 
                   user.profile === '2' ? 'OPERATIVO' : 
                   user.profile === '3' ? 'GENERAL' : user.profile}
                </td>
                <td className="py-1 px-4">{user.status ? 'ACTIVO' : 'INACTIVO'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={`${loading ? 'w-full h-32' : ''} flex items-center justify-center mt-9`}>
          <div role="status" className={`${ loading ? '' : 'hidden' } absolute opacity-100 -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2 p-96`}>
            <svg aria-hidden="true" className="w-28 h-28 mr-2 text-gray-400 animate-spin fill-colorPrimario" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>

      {/* Paginación y contador de resultados */}
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
            
            {/* Generate page numbers to display */}
            {(() => {
              const pages = [];
              const pagesToShow = window.innerWidth < 640 ? 5 : 10; // Menos páginas en móvil
              let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
              let endPage = Math.min(pagination.lastPage, startPage + pagesToShow - 1);

              // Adjust startPage and endPage if they hit the boundaries
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
                    : 'bg-white border border-gray-300 text-gray-700 opacity-50 cursor-default' // Style for ellipsis
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

export default UsuarioList; 