import React, { useState, useEffect } from 'react';
import UserMenu from './DropdownProfile';
import LogoEdoMex from '../images/Recurso 6.png';
import { useSelector, useDispatch } from 'react-redux';
import { logout, checkUserStatus } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Header({ sidebarOpen, setSidebarOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Saludo según la hora
  const hours = new Date().getHours();
  let greetings = '';
  if (hours >= 6 && hours <= 11) {
    greetings = 'Buenos días';
  } else if (hours > 11 && hours <= 18) {
    greetings = 'Buenas tardes';
  } else {
    greetings = 'Buenas noches';
  }

  const { user } = useSelector(state => state.auth);
  const email = user?.email;

  // Estado del contador de sesión
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    const checkSession = () => {
      const expiry = localStorage.getItem('sessionExpiry');
      if (expiry) {
        const timeLeft = Number(expiry) - Date.now();
        if (timeLeft <= 0) {
          // Sesión expirada
          dispatch(logout());
          navigate('/');
          Swal.fire({
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
          });
        } else {
          setRemainingTime(timeLeft);
        }
      }
    };

    // Verificar el status del usuario cada 30 minutos
    const statusInterval = setInterval(() => {
      dispatch(checkUserStatus());
      //}, 60000);
    }, 30 * 60 * 1000); // 30 minutos

    // Verificar la sesión cada segundo
    const sessionInterval = setInterval(checkSession, 1000);

    // Verificar el status inmediatamente al montar el componente
    dispatch(checkUserStatus());

    return () => {
      clearInterval(statusInterval);
      clearInterval(sessionInterval);
    };
  }, [dispatch, navigate]);

  // Formatear el tiempo como mm:ss
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 bg-transparent border-slate-200 z-30 pl-2 pr-2">
      <section className="flex relative pt-1 bg-white/80 shadow-2xl rounded-xl md:block">
        {/* Botón sidebar móvil */}
        <button
          className="text-slate-500 hover:text-slate-600 lg:hidden"
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <rect x="4" y="5" width="16" height="2" />
            <rect x="4" y="11" width="16" height="2" />
            <rect x="4" y="17" width="16" height="2" />
          </svg>
        </button>
        {/* Barra superior de color */}
        <div className="w-full absolute rounded-t-lg top-0 left-0 z-0 h-10 hidden md:block bg-colorSecundario" />
        <div className="w-full ml-0 md:ml-6 px-1 md:px-2">
          <div className="flex items-center justify-between relative z-10">
            <div className="block">
              <img
                src={LogoEdoMex}
                alt="logo-edomex"
                className="-ml-4 h-12 w-32 md:h-8 md:w-36 -mt-1 hidden md:block"
              />
              <div className="md:ml-0 mt-1 flex flex-col sm:flex-row max-sm:gap-2 items-center justify-between">
                <div className="flex">
                  <h3 className="font-manrope md:mt-1 hidden md:block font-normal text-xs text-slate-750 mb-1 md:text-sm">
                    {email?.trim() + ','}
                  </h3>
                  <p className="font-manrope md:mt-1 font-semibold text-xs text-slate-750 mb-1 md:text-sm">
                    &nbsp; {greetings} 👋
                  </p>
                </div>
              </div>
              {/* Contador visible */}
             {/* {remainingTime !== null && (
                <p className="text-xs text-slate-500 mt-1 ml-1">
                  ⏳ Cierre automático en: <span className="font-semibold text-slate-700">{formatTime(remainingTime)}</span>
                </p>
              )} */}
            </div>
            <div className="flex items-center space-x-3 md:mt-8 mr-3 md:mr-10">
              <UserMenu align="right" />
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}

export default Header; 