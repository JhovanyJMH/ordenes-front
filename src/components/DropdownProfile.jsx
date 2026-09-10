import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import Swal from 'sweetalert2';

function DropdownProfile({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector(state => state.auth);
  const email = user?.email;
  const profile = user?.profile;
  const name = user?.name;




  // Cerrar al hacer click fuera
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Cerrar si se presiona ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas cerrar tu sesión?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      dispatch(logout());
      navigate('/login', { replace: true });
      Swal.fire({
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="inline-flex justify-center items-center group"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <div className="flex items-center truncate">
          <span className="truncate ml-2 text-sm font-medium text-slate-700 group-hover:text-slate-800">
            { name }
          </span>
          <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-slate-400" viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </button>

      <div
        ref={dropdown}
        className={`origin-top-right z-10 absolute top-full min-w-44 bg-white border border-slate-200 py-1.5 rounded shadow-lg overflow-hidden mt-1 ${
          align === 'right' ? 'right-0' : 'left-0'
        } ${dropdownOpen ? 'block' : 'hidden'}`}
      >
        <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-slate-200">
          <div className="font-medium text-slate-800"> { profile === '1' ? 'Administrador' : profile === '2' ? 'Editor' : profile === '3' ? 'Cliente' : profile } </div>
        </div>
        <ul>
          
          <li>
            <button
              className="font-medium text-sm text-slate-600 hover:text-slate-800 flex items-center py-1 px-3 w-full"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default DropdownProfile; 