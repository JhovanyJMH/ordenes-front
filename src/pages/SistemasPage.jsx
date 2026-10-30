import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import {
  SistemasList,
  SistemasDelPrincipalList,
  SistemaPrincipalForm,
  SistemaPrincipalEdit,
  SistemaForm,
  SistemaEdit,
} from '../components/sistemas';
import { FiChevronRight, FiLayers, FiPlus, FiCpu } from 'react-icons/fi';

const SistemasPage = () => {
  const location = useLocation();
  const { sistemaPrincipalId } = useParams();

  // Detectar página actual
  const isListPage = location.pathname === "/catalogo-sistemas" || location.pathname === "/catalogo-sistemas/";
  const isRegisterPage = location.pathname === "/catalogo-sistemas/registrar";
  const isEditPage = location.pathname.startsWith("/catalogo-sistemas/editar");
  const isSistemasDelPrincipalPage = location.pathname.match(/^\/catalogo-sistemas\/\d+\/sistemas$/);
  const isRegisterSistemaPage = location.pathname.match(/^\/catalogo-sistemas\/\d+\/sistemas\/registrar$/);
  const isEditSistemaPage = location.pathname.match(/^\/catalogo-sistemas\/\d+\/sistemas\/editar\/\d+$/);

  // Breadcrumb dinámico
  const getBreadcrumb = () => {
    const items = [
      { label: 'Sistemas', path: '/catalogo-sistemas', icon: <FiLayers size={16} /> },
    ];

    if (isRegisterPage) {
      items.push({ label: 'Registrar', path: '/catalogo-sistemas/registrar', icon: <FiPlus size={16} /> });
    } else if (isEditPage) {
      items.push({ label: 'Editar', path: location.pathname, icon: <FiPlus size={16} /> });
    } else if (sistemaPrincipalId && (isSistemasDelPrincipalPage || isRegisterSistemaPage || isEditSistemaPage)) {
      items.push({ label: 'Sistemas', path: `/catalogo-sistemas/${sistemaPrincipalId}/sistemas`, icon: <FiCpu size={16} /> });
      
      if (isRegisterSistemaPage) {
        items.push({ label: 'Registrar', path: location.pathname, icon: <FiPlus size={16} /> });
      } else if (isEditSistemaPage) {
        items.push({ label: 'Editar', path: location.pathname, icon: <FiPlus size={16} /> });
      }
    }

    return items;
  };

  return (
    <div className="min-w-0 w-full overflow-x-hidden bg-[#f4f7fa]">
      <div className="w-full min-w-0 rounded-xl bg-white p-4 shadow-lg md:p-8 lg:p-12">
        <h1 className="text-left text-3xl font-extrabold text-colorPrimario mb-1 md:mb-0 sm:text-4xl lg:text-5xl">
          Catálogo de <span className="font-normal text-gray-500">sistemas</span>
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

        <Routes>
          <Route index element={<SistemasList />} />
          <Route path="registrar" element={<SistemaPrincipalForm />} />
          <Route path="editar/:id" element={<SistemaPrincipalEdit />} />
          <Route path=":sistemaPrincipalId/sistemas" element={<SistemasDelPrincipalList />} />
          <Route path=":sistemaPrincipalId/sistemas/registrar" element={<SistemaForm />} />
          <Route path=":sistemaPrincipalId/sistemas/editar/:id" element={<SistemaEdit />} />
        </Routes>
      </div>
    </div>
  );
};

export default SistemasPage;
