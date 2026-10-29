import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import LogoBienestar from '../images/logo-bienestar_blank.png';
import Swal from 'sweetalert2';
import SidebarLinkGroup from './SidebarLinkGroup';
import { canAccessDocumentosModulos } from '../utils/access';

const itemBase = 'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200';
const itemIdle = 'text-white/75 hover:text-white hover:bg-white/10';
const itemActive = 'bg-white/15 text-white shadow-sm ring-1 ring-colorSecundario/40';
const childIdle = 'text-white/65 hover:text-white hover:bg-white/10';
const childActive = 'bg-colorSecundario/25 text-white font-semibold';

function NavIcon({ children, active }) {
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
      active ? 'bg-colorSecundario/25 text-colorSecundario' : 'bg-white/10 text-white/70 group-hover:bg-white/15 group-hover:text-white'
    }`}>
      {children}
    </span>
  );
}

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { pathname } = location;
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const canSeeDocumentos = canAccessDocumentosModulos(user);
  const isAdmin = user?.profile === '1';

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true');

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

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

  const labelClass = `whitespace-nowrap duration-200 ${sidebarExpanded ? 'opacity-100' : 'pointer-events-none hidden opacity-0'}`;

  async function onLogout() {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar tu sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8A2036',
      cancelButtonColor: '#6b7280',
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

  const documentosActive = pathname.includes('generador-documentos')
    || pathname.includes('fichas-liberacion')
    || pathname.includes('control-cambios');

  return (
    <div>
      <div
        className={`fixed inset-0 z-40 bg-colorPrimario/40 backdrop-blur-[2px] transition-opacity duration-200 md:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      <aside
        id="sidebar"
        ref={sidebar}
        className={`absolute left-0 top-0 z-40 flex h-screen shrink-0 flex-col overflow-y-auto overflow-x-hidden no-scrollbar bg-colorPrimario shadow-[8px_0_32px_rgba(80,16,32,0.28)] transition-all duration-300 ease-out md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarExpanded ? 'w-72' : 'w-[5.25rem]'}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(188,149,91,0.18),transparent_55%)]" />

        <div className="relative flex items-center justify-between px-3 pb-2 pt-4">
          <button
            ref={trigger}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Cerrar menú</span>
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          <div className={`flex flex-1 items-center justify-center ${sidebarExpanded ? 'px-2' : ''}`}>
            <img
              className={`transition-all duration-300 ${sidebarExpanded ? 'h-20 w-auto opacity-100' : 'h-10 w-10 object-contain opacity-90'}`}
              src={LogoBienestar}
              alt="BIENESTAR"
            />
          </div>
        </div>

        <nav className="relative flex flex-1 flex-col px-3 pb-4">
          <p className={`mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-colorSecundario/80 ${sidebarExpanded ? 'block' : 'hidden'}`}>
            Menú
          </p>
          <ul className="space-y-1">
            <SidebarLinkGroup activecondition={pathname === '/' || pathname.includes('dashboard') || pathname.includes('solicitudes-general')}>
              {(handleClick, open) => (
                <React.Fragment>
                  <button
                    type="button"
                    title="Panel de Control"
                    className={`${itemBase} w-full ${pathname.includes('dashboard') || pathname.includes('solicitudes-general') ? itemActive : itemIdle}`}
                    onClick={() => (sidebarExpanded ? handleClick() : setSidebarExpanded(true))}
                  >
                    <NavIcon active={pathname.includes('dashboard') || pathname.includes('solicitudes-general')}>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="8" height="8" rx="1.75" stroke="currentColor" strokeWidth="1.6" />
                        <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                        <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                        <rect x="3" y="13" width="8" height="8" rx="1.75" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    </NavIcon>
                    <span className={`flex-1 text-left ${labelClass}`}>Panel de Control</span>
                    {sidebarExpanded && (
                      <svg className={`h-3 w-3 fill-current text-white/50 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12">
                        <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                      </svg>
                    )}
                  </button>
                  <ul className={`ml-[2.65rem] mt-1 space-y-1 border-l border-white/15 pl-3 ${!open || !sidebarExpanded ? 'hidden' : ''}`}>
                    <li>
                      <NavLink
                        end
                        to="/dashboard"
                        className={({ isActive }) => `block rounded-lg px-3 py-1.5 text-sm transition ${isActive ? childActive : childIdle}`}
                      >
                        Principal
                      </NavLink>
                    </li>
                    {isAdmin && (
                      <li>
                        <NavLink
                          to="/solicitudes-general"
                          className={({ isActive }) => `block rounded-lg px-3 py-1.5 text-sm transition ${isActive ? childActive : childIdle}`}
                        >
                          General
                        </NavLink>
                      </li>
                    )}
                  </ul>
                </React.Fragment>
              )}
            </SidebarLinkGroup>

            {isAdmin && (
              <SidebarLinkGroup activecondition={pathname.includes('catalogo') || pathname.includes('refacciones')}>
                {(handleClick, open) => (
                  <React.Fragment>
                    <button
                      type="button"
                      title="Catálogos"
                      className={`${itemBase} w-full ${pathname.includes('catalogo') ? itemActive : itemIdle}`}
                      onClick={() => (sidebarExpanded ? handleClick() : setSidebarExpanded(true))}
                    >
                      <NavIcon active={pathname.includes('catalogo')}>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="4" width="13" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
                          <path d="M7 9h7M7 13h7M7 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </NavIcon>
                      <span className={`flex-1 text-left ${labelClass}`}>Catálogos</span>
                      {sidebarExpanded && (
                        <svg className={`h-3 w-3 fill-current text-white/50 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12">
                          <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                        </svg>
                      )}
                    </button>
                    <ul className={`ml-[2.65rem] mt-1 space-y-1 border-l border-white/15 pl-3 ${!open || !sidebarExpanded ? 'hidden' : ''}`}>
                      {[
                        ['/catalogo-usuarios', 'Usuarios'],
                        ['/catalogo-adscripciones', 'Adscripciones'],
                        ['/catalogo-empleados', 'Empleados'],
                        ['/catalogo-categorias', 'Categorías'],
                        ['/catalogo-equipos', 'Equipos'],
                        ['/catalogo-refacciones', 'Refacciones'],
                        ['/catalogo-sistemas', 'Sistemas'],
                      ].map(([to, label]) => (
                        <li key={to}>
                          <NavLink
                            to={to}
                            className={({ isActive }) => `block rounded-lg px-3 py-1.5 text-sm transition ${isActive ? childActive : childIdle}`}
                          >
                            {label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </React.Fragment>
                )}
              </SidebarLinkGroup>
            )}

            {isAdmin && (
              <li>
                <NavLink
                  to="/informes"
                  title="Informes"
                  className={({ isActive }) => `${itemBase} ${isActive ? itemActive : itemIdle}`}
                >
                  {({ isActive }) => (
                    <>
                      <NavIcon active={isActive}>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <path d="M6 4h9l3 3v13H6V4z" stroke="currentColor" strokeWidth="1.6" />
                          <path d="M15 4v3h3M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </NavIcon>
                      <span className={labelClass}>Informes</span>
                    </>
                  )}
                </NavLink>
              </li>
            )}

            <li>
              <NavLink
                to="/solicitudes"
                title="Solicitudes"
                className={({ isActive }) => `${itemBase} ${isActive ? itemActive : itemIdle}`}
              >
                {({ isActive }) => (
                  <>
                    <NavIcon active={isActive}>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M7 9h10M7 13h10M7 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </NavIcon>
                    <span className={labelClass}>Solicitudes</span>
                  </>
                )}
              </NavLink>
            </li>
          </ul>

          {canSeeDocumentos && (
            <>
              <p className={`mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-colorSecundario/80 ${sidebarExpanded ? 'block' : 'hidden'}`}>
                Desarrollo
              </p>
              <p className={`${sidebarExpanded ? 'hidden' : 'my-3 block text-center text-colorSecundario/70'}`} aria-hidden="true">•••</p>
              <ul className="space-y-1">
                <SidebarLinkGroup activecondition={documentosActive}>
                  {(handleClick, open) => (
                    <React.Fragment>
                      <button
                        type="button"
                        title="Documentación de sistemas"
                        className={`${itemBase} w-full ${documentosActive ? itemActive : itemIdle}`}
                        onClick={() => (sidebarExpanded ? handleClick() : setSidebarExpanded(true))}
                      >
                        <NavIcon active={documentosActive}>
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.6" />
                            <path d="M14 3v5h5M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </NavIcon>
                        <span className={`flex-1 text-left ${labelClass}`}>Documentación</span>
                        {sidebarExpanded && (
                          <svg className={`h-3 w-3 fill-current text-white/50 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12">
                            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                          </svg>
                        )}
                      </button>
                      <ul className={`ml-[2.65rem] mt-1 space-y-1 border-l border-white/15 pl-3 ${!open || !sidebarExpanded ? 'hidden' : ''}`}>
                        <li>
                          <NavLink
                            to="/generador-documentos"
                            className={({ isActive }) => `block rounded-lg px-3 py-1.5 text-sm transition ${isActive ? childActive : childIdle}`}
                          >
                            Generador de documentos
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/fichas-liberacion"
                            className={({ isActive }) => `block rounded-lg px-3 py-1.5 text-sm transition ${isActive ? childActive : childIdle}`}
                          >
                            Fichas de liberación
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/control-cambios"
                            className={({ isActive }) => `block rounded-lg px-3 py-1.5 text-sm transition ${isActive ? childActive : childIdle}`}
                          >
                            Control de cambios
                          </NavLink>
                        </li>
                      </ul>
                    </React.Fragment>
                  )}
                </SidebarLinkGroup>
              </ul>
            </>
          )}

          <div className="mt-auto space-y-3 pt-6">
            {sidebarExpanded && (
              <div className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/10">
                <p className="truncate text-sm font-semibold text-white">{user?.nombre_completo || user?.name || 'Usuario'}</p>
                <p className="truncate text-xs text-white/60">{user?.email}</p>
              </div>
            )}
            <button
              type="button"
              title="Cerrar sesión"
              onClick={onLogout}
              className={`${itemBase} w-full text-white/80 hover:bg-white/10 hover:text-white`}
            >
              <NavIcon>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M10 7V5a2 2 0 012-2h7v18h-7a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M4 12h11M12 8l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </NavIcon>
              <span className={labelClass}>Cerrar sesión</span>
            </button>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSidebarExpanded((prev) => !prev)}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <span className="sr-only">Expandir o colapsar menú</span>
                <svg className={`h-5 w-5 fill-current transition-transform ${sidebarExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24">
                  <path d="M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </aside>
    </div>
  );
}

export default Sidebar;
