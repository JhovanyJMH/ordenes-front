import { Routes, Route, Link, useLocation } from 'react-router-dom';
import RefaccionesList from '../components/refacciones/RefaccionesList';
import RefaccionForm from '../components/refacciones/RefaccionForm';
import RefaccionEdit from '../components/refacciones/RefaccionEdit';
import { FiChevronRight, FiBox, FiPlus } from 'react-icons/fi';

const RefaccionesPage = () => {
  const location = useLocation();

  // Detectar página actual
  const isListPage = location.pathname === "/catalogo-refacciones" || location.pathname === "/catalogo-refacciones/";
  const isRegisterPage = location.pathname === "/catalogo-refacciones/registrar";
  const isEditPage = location.pathname.startsWith("/catalogo-refacciones/editar");

  // Breadcrumb dinámico
  const getBreadcrumb = () => {
    const items = [
      { label: 'Refacciones', path: '/catalogo-refacciones', icon: <FiBox size={16} /> },
    ];

    if (isRegisterPage) {
      items.push({ label: 'Registrar', path: '/catalogo-refacciones/registrar', icon: <FiPlus size={16} /> });
    } else if (isEditPage) {
      items.push({ label: 'Editar', path: location.pathname, icon: <FiPlus size={16} /> });
    }

    return items;
  };

  return (
    <div className="bg-[#f4f7fa] w-full">
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12">
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-1 md:mb-0 text-left">
          Administración de<span className="text-gray-500 font-normal"> refacciones</span>
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
          <Route index element={<RefaccionesList />} />
          <Route path="registrar" element={<RefaccionForm />} />
          <Route path="editar/:id" element={<RefaccionEdit />} />
        </Routes>
      </div>
    </div>
  );
};

export default RefaccionesPage;
