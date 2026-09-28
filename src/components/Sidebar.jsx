import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import LogoBienestar from '../images/logo-bienestar_blank.png';
import Swal from 'sweetalert2';
import SidebarLinkGroup from './SidebarLinkGroup';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { pathname } = location;
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true');

  // Cerrar al hacer click fuera
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Cerrar con ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector('body').classList.add('sidebar-expanded');
    } else {
      document.querySelector('body').classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  async function onLogout() {
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
  }

  return (
    <div>
      {/* Fondo para móvil */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0 md:static md:left-auto md:top-auto md:translate-x-0 h-screen overflow-y-scroll md:overflow-y-auto no-scrollbar shrink-0 bg-colorPrimario p-4 transition-all duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-64'
        } md:translate-x-0 ${
          sidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          {/* Botón cerrar */}
          <button
            ref={trigger}
            className="lg:hidden text-slate-200 hover:text-slate-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Cerrar sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <img className="w-40 h-40 sm:w-auto sm:h-full" src={LogoBienestar} alt="BIENESTAR"/>
        </div>

        {/* Links */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xs uppercase text-slate-200 font-semibold pl-3">
              <span className={`${sidebarExpanded ? 'hidden' : 'block'} text-center w-6`} aria-hidden="true">•••</span>
              <span className={`${sidebarExpanded ? 'block' : 'hidden'}`}>MENÚ</span>
            </h3>
            <ul className="mt-3">
              {/* Dashboard */}
              <SidebarLinkGroup activecondition={pathname === '/' || pathname.includes('dashboard') || pathname.includes('solicitudes-general')}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <a
                        href="#0"
                        className={`block truncate transition duration-150 ${
                          pathname === '/' || pathname.includes('dashboard') ? 'text-slate-100 hover:text-white' : 'text-slate-300 hover:text-slate-100'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg
                              className={`shrink-0 h-6 w-6 ${pathname.includes('dashboard') ? 'fade-zoom' : ''}`}
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                x="2.5"
                                y="3.5"
                                width="7"
                                height="7"
                                rx="1.75"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className={`${pathname.includes('dashboard') ? 'text-red-400' : 'text-slate-400'}`}
                              />
                              <rect
                                x="14.5"
                                y="3.5"
                                width="7"
                                height="7"
                                rx="1.75"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className={`${pathname.includes('dashboard') ? 'text-red-300' : 'text-slate-400'}`}
                              />
                              <rect
                                x="2.5"
                                y="13"
                                width="9"
                                height="7"
                                rx="1.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className={`${pathname.includes('dashboard') ? 'text-red-500' : 'text-slate-600'}`}
                              />
                              <rect
                                x="13.5"
                                y="13"
                                width="8.5"
                                height="7"
                                rx="1.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className={`${pathname.includes('dashboard') ? 'text-red-500' : 'text-slate-600'}`}
                              />
                            </svg>
                            <span className={`text-sm font-medium ml-3 duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                              Panel de Control
                            </span>
                          </div>
                          <div className="flex shrink-0 ml-2">
                            <svg className={`w-3 h-3 shrink-0 ml-1 fill-current text-slate-100 ${open && 'rotate-180'}`} viewBox="0 0 12 12">
                              <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                            </svg>
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                        <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              end
                              to="/dashboard"
                              className={({ isActive }) =>
                                'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                              }
                            >
                              <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                Principal
                              </span>
                            </NavLink>
                          </li>
                          {user?.profile === '1' && (
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                to="/solicitudes-general"
                                className={({ isActive }) =>
                                  'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                                }
                              >
                                <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                  General
                                </span>
                              </NavLink>
                            </li>
                          )}
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>

              {/* Catálogos */}
              {user?.profile === '1' && (
                <SidebarLinkGroup activecondition={pathname === '/' || pathname.includes('catalogo') || pathname.includes('refacciones')}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block truncate transition duration-150 ${
                            pathname === '/' || pathname.includes('catalogo') ? 'text-slate-100 hover:text-white' : 'text-slate-300 hover:text-slate-100'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                className={`shrink-0 h-6 w-6 ${pathname === '/' || pathname.includes('catalogo') ? 'fade-zoom' : ''}`}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect
                                  x="2.5"
                                  y="4"
                                  width="13"
                                  height="16"
                                  rx="2.25"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  className={`${pathname === '/' || pathname.includes('catalogo') ? 'text-cyan-500' : 'text-slate-600'}`}
                                />
                                <rect
                                  x="7.5"
                                  y="6"
                                  width="13"
                                  height="12"
                                  rx="1.5"
                                  fill="currentColor"
                                  className={`${pathname === '/' || pathname.includes('catalogo') ? 'text-cyan-400/30' : 'text-slate-600/10'}`}
                                />
                                <path
                                  d="M5.5 8.5h9"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  className={`${pathname === '/' || pathname.includes('catalogo') ? 'text-cyan-500' : 'text-slate-400'}`}
                                />
                                <path
                                  d="M5.5 12.5h9"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  className={`${pathname === '/' || pathname.includes('catalogo') ? 'text-cyan-500' : 'text-slate-400'}`}
                                />
                                <path
                                  d="M5.5 16.5h6"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  className={`${pathname === '/' || pathname.includes('catalogo') ? 'text-cyan-500' : 'text-slate-400'}`}
                                />
                              </svg>
                              <span className={`text-sm font-medium ml-3 duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                Catalogos
                              </span>
                            </div>
                            <div className="flex shrink-0 ml-2">
                              <svg className={`w-3 h-3 shrink-0 ml-1 fill-current text-slate-100 ${open && 'rotate-180'}`} viewBox="0 0 12 12">
                                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                              </svg>
                            </div>
                          </div>
                        </a>
                        <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                          <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                to="/catalogo-usuarios"
                                className={({ isActive }) =>
                                  'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                                }
                              >
                                <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                  Usuarios
                                </span>
                              </NavLink>
                            </li>
                            
                           </ul>
                          <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                            {/* <li className="mb-1 last:mb-0">
                              <NavLink
                                to="/catalogo-dependencias"
                                className={({ isActive }) =>
                                  'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                                }
                              >
                                <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                  Dependencias
                                </span>
                              </NavLink>
                            </li> */}
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                to="/catalogo-adscripciones"
                                className={({ isActive }) =>
                                  'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                                }
                              >
                                <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                  Adscripciones
                                </span>
                              </NavLink>
                            </li>
                            
                           </ul>
                          <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                to="/catalogo-empleados"
                                className={({ isActive }) =>
                                  'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                                }
                              >
                                <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                  Empleados
                                </span>
                              </NavLink>
                            </li>
                            
                           </ul>
                          <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                to="/catalogo-categorias"
                                className={({ isActive }) =>
                                  'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                                }
                              >
                                <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                  Categorías
                                </span>
                              </NavLink>
                            </li>
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                to="/catalogo-equipos"
                                className={({ isActive }) =>
                                  'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                                }
                              >
                                <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                  Equipos
                                </span>
                              </NavLink>
                            </li>
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                to="/catalogo-refacciones"
                                className={({ isActive }) =>
                                  'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                                }
                              >
                                <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                  Refacciones
                                </span>
                              </NavLink>
                            </li>
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                to="/catalogo-sistemas"
                                className={({ isActive }) =>
                                  'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                                }
                              >
                                <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                  Sistemas
                                </span>
                              </NavLink>
                            </li>
                            
                           </ul>
                        </div>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}

              {user?.profile === '1' && (
                <li className="px-3 py-2 rounded-sm mb-0.5 last:mb-0">
                  <NavLink
                    to="/informes"
                    className={({ isActive }) =>
                      'block transition duration-150 truncate rounded-sm ' + (isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:text-white hover:bg-white/5')
                    }
                  >
                    <div className="flex items-center">
                      <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 4h9l3 3v13H6V4z" stroke="currentColor" strokeWidth="1.5" className="text-slate-600" />
                        <path d="M15 4v3h3M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-400" />
                      </svg>
                      <span className={`text-sm font-medium ml-3 duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        Informes
                      </span>
                    </div>
                  </NavLink>
                </li>
              )}

              {/* Solicitudes */}
              <li className="px-3 py-2 rounded-sm mb-0.5 last:mb-0">
                <NavLink
                  to="/solicitudes"
                  className={({ isActive }) =>
                    'block transition duration-150 truncate rounded-sm ' + (isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:text-white hover:bg-white/5')
                  }
                >
                  <div className="flex items-center">
                    <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-slate-600" />
                      <path d="M7 9h10M7 13h10M7 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-400" />
                    </svg>
                    <span className={`text-sm font-medium ml-3 duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                      Solicitudes
                    </span>
                  </div>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Más */}
          <div>
            <h3 className="text-xs uppercase text-slate-500 font-semibold pl-3">  
              <span className={`${sidebarExpanded ? 'hidden' : 'block'} text-center w-6`} aria-hidden="true">•••</span>
              <span className={`${sidebarExpanded ? 'block' : 'hidden'}`}>Más</span>
            </h3>
            <ul className="mt-3">
              {/* Generador de Documentos */}
              {user?.profile === '1' && (
                <>
                  <li className="px-3 py-2 rounded-sm mb-0.5 last:mb-0">
                    <NavLink
                      to="/generador-documentos"
                      className={({ isActive }) =>
                        'block transition duration-150 truncate rounded-sm ' + (isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:text-white hover:bg-white/5')
                      }
                    >
                      <div className="flex items-center">
                        <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" className="text-slate-600" />
                          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" />
                          <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-400" />
                        </svg>
                        <span className={`text-sm font-medium ml-3 duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                          Generador Documentos
                        </span>
                      </div>
                    </NavLink>
                  </li>

                  <li className="px-3 py-2 rounded-sm mb-0.5 last:mb-0">
                    <NavLink
                      to="/fichas-liberacion"
                      className={({ isActive }) =>
                        'block transition duration-150 truncate rounded-sm ' + (isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:text-white hover:bg-white/5')
                      }
                    >
                      <div className="flex items-center">
                        <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 5.5A2.5 2.5 0 017.5 3h9A2.5 2.5 0 0119 5.5v13A2.5 2.5 0 0116.5 21h-9A2.5 2.5 0 015 18.5v-13z" stroke="currentColor" strokeWidth="1.5" className="text-slate-600" />
                          <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-slate-400" />
                        </svg>
                        <span className={`text-sm font-medium ml-3 duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                          Fichas liberación
                        </span>
                      </div>
                    </NavLink>
                  </li>
                </>
              )}

              {/* Autenticación */}
              <SidebarLinkGroup>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <a
                        href="#0"
                        className={`block text-slate-200 truncate transition duration-150 ${open ? 'hover:text-slate-200' : 'hover:text-white'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
                              <path className="fill-current text-slate-600" d="M8.07 16H10V8H8.07a8 8 0 110 8z" />
                              <path className="fill-current text-slate-400" d="M15 12L8 6v5H0v2h8v5z" />
                            </svg>
                            <span className={`text-sm font-medium ml-3 duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                              Autenticación
                            </span>
                          </div>
                          {/* Icon */}
                          <div className="flex shrink-0 ml-2">
                            <svg
                              className={`w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 ${open && 'rotate-180'}`}
                              viewBox="0 0 12 12"
                            >
                              <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                            </svg>
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                        <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                          <li className="mb-1 last:mb-0">
                            <button 
                              onClick={onLogout} 
                              className="block text-slate-400 hover:text-slate-200 transition duration-150 truncate"
                            >
                              <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                Salir
                              </span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
            </ul>
          </div>
        </div>

        {/* Botón expandir/collapse */}
        <div className="pt-3 inline-flex justify-end mt-auto">
          <div className="px-3 py-2">
            <button 
              onClick={() => {
                const newState = !sidebarExpanded;
                setSidebarExpanded(newState);
                localStorage.setItem('sidebar-expanded', newState);
                if (newState) {
                  document.querySelector('body').classList.add('sidebar-expanded');
                } else {
                  document.querySelector('body').classList.remove('sidebar-expanded');
                }
              }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-200"
            >
              <span className="sr-only">Expandir/Colapsar sidebar</span>
              <svg 
                className={`w-6 h-6 fill-current transition-transform duration-200 ${sidebarExpanded ? 'rotate-180' : ''}`} 
                viewBox="0 0 24 24"
              >
                <path className="text-slate-400" d="M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z" />
                <path className="text-slate-600" d="M3 23H1V1h2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
