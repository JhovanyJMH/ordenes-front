import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchUsers, clearError, clearSuccessMessage } from '../features/users/usersSlice';
import UsuarioList from '../components/users/UsuarioList';
import UsuarioForm from '../components/users/UsuarioForm';
import UsuarioEdit from '../components/users/UsuarioEdit';
import Swal from 'sweetalert2';
import { FiChevronRight, FiUsers, FiUserPlus } from 'react-icons/fi';

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, successMessage } = useSelector((state) => state.users);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        title: 'Error',
        text: error,
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Entendido'
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      Swal.fire({
        title: '¡Éxito!',
        text: successMessage,
        icon: 'success',
        confirmButtonColor: '#059669',
        confirmButtonText: 'Entendido',
        timer: 2000,
        showConfirmButton: false
      });
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  // Solo mostrar en la lista
  const isListPage = location.pathname === "/catalogo-usuarios" || location.pathname === "/catalogo-usuarios/";
  const isRegisterPage = location.pathname === "/catalogo-usuarios/registrar";
  const isEditPage = location.pathname.startsWith("/catalogo-usuarios/editar");

  // Breadcrumb dinámico
  const getBreadcrumb = () => {
    const items = [
      { label: 'Usuarios', path: '/catalogo-usuarios', icon: <FiUsers size={16} /> },
    ];

    if (isRegisterPage) {
      items.push({ label: 'Registrar', path: '/catalogo-usuarios/registrar', icon: <FiUserPlus size={16} /> });
    } else if (isEditPage) {
      items.push({ label: 'Editar', path: location.pathname, icon: <FiUserPlus size={16} /> });
    }

    return items;
  };

  return (
    <div className="bg-[#f4f7fa] w-full">
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12">
        {/* Título en una fila independiente */}
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-1 md:mb-0 text-left">
          Administración de<span className="text-gray-500 font-normal"> usuarios</span>
        </h1>
        {/* Breadcrumb moderno */}
        <nav className="flex items-center gap-2 mt-4 mb-8">
          {getBreadcrumb().map((item, index) => (
            <div key={item.path} className="flex items-center gap-2">
              {index > 0 && (
                <FiChevronRight size={14} className="text-gray-400" />
              )}
              <Link
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  index === getBreadcrumb().length - 1
                    ? 'bg-[#BC955B] text-white shadow-md shadow-[#BC955B]/20'
                    : 'bg-[#f5e8e0] text-[#BC955B] hover:bg-[#BC955B] hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </div>
          ))}
        </nav>
       
        {/* Tabla de usuarios */}
        <Routes>
          <Route path="/" element={<UsuarioList search={search} />} />
          <Route path="registrar" element={<UsuarioForm />} />
          <Route path="editar/:id" element={<UsuarioEdit />} />
        </Routes>
      </div>
    </div>
  );
};

export default UsersPage;
