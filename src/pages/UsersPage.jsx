import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchUsers, clearError, clearSuccessMessage } from '../features/users/usersSlice';
import UsuarioList from '../components/users/UsuarioList';
import UsuarioForm from '../components/users/UsuarioForm';
import UsuarioEdit from '../components/users/UsuarioEdit';
import Swal from 'sweetalert2';

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

  return (
    <div className="bg-[#f4f7fa] w-full">
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12">
        {/* Título en una fila independiente */}
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-1 md:mb-0 text-left">
          Administración de<span className="text-gray-500 font-normal"> usuarios</span>
        </h1>
        {/* Breadcrumb en otra fila */}
        <nav className="text-sm text-gray-500 flex items-center gap-2 mt-2 md:mt-0 justify-start md:justify-end w-full md:w-auto mb-8">
          <Link to="/catalogo-usuarios" className="text-colorPrimario font-semibold hover:underline">Lista de usuarios</Link>
          <span className="mx-1">&gt;</span>
          <Link to="/catalogo-usuarios/registrar" className="hover:underline">Registrar usuario</Link>
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
