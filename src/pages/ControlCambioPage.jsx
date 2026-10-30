import { Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import ControlCambioList from '../components/controlCambio/ControlCambioList';
import ControlCambioForm from '../components/controlCambio/ControlCambioForm';
import { FiChevronRight, FiGitMerge, FiPlus } from 'react-icons/fi';

const ControlCambioFormRoute = () => {
  const { id } = useParams();
  return <ControlCambioForm mode={id ? 'edit' : 'create'} editId={id} />;
};

const ControlCambioPage = () => {
  const location = useLocation();

  // Detectar página actual
  const isListPage = location.pathname === "/control-cambios" || location.pathname === "/control-cambios/";
  const isRegisterPage = location.pathname === "/control-cambios/registrar";
  const isEditPage = location.pathname.startsWith("/control-cambios/editar");

  // Breadcrumb dinámico
  const getBreadcrumb = () => {
    const items = [
      { label: 'Control de cambios', path: '/control-cambios', icon: <FiGitMerge size={16} /> },
    ];

    if (isRegisterPage) {
      items.push({ label: 'Registrar', path: '/control-cambios/registrar', icon: <FiPlus size={16} /> });
    } else if (isEditPage) {
      items.push({ label: 'Editar', path: location.pathname, icon: <FiPlus size={16} /> });
    }

    return items;
  };

  return (
    <div className="min-w-0 w-full overflow-x-hidden bg-[#f4f7fa]">
      <div className="w-full min-w-0 rounded-xl bg-white p-4 shadow-lg md:p-8 lg:p-12">
        <h1 className="text-left text-3xl font-extrabold text-colorPrimario mb-1 md:mb-0 sm:text-4xl lg:text-5xl">
          Administración de <span className="text-gray-500 font-normal">control de cambios</span>
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
          <Route index element={<ControlCambioList />} />
          <Route path="registrar" element={<ControlCambioFormRoute />} />
          <Route path="editar/:id" element={<ControlCambioFormRoute />} />
        </Routes>
      </div>
    </div>
  );
};

export default ControlCambioPage;
