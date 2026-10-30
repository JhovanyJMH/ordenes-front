import { Routes, Route, Link, useLocation } from 'react-router-dom';
import EmpleadoList from '../components/empleados/EmpleadoList';
import EmpleadoForm from '../components/empleados/EmpleadoForm';
import EmpleadoEdit from '../components/empleados/EmpleadoEdit';
import { FiChevronRight, FiList, FiPlus } from 'react-icons/fi';

const EmpleadosPage = () => {
  const location = useLocation();

  // Solo mostrar en la lista
  const isListPage = location.pathname === "/catalogo-empleados" || location.pathname === "/catalogo-empleados/";
  const isRegisterPage = location.pathname === "/catalogo-empleados/registrar";
  const isEditPage = location.pathname.startsWith("/catalogo-empleados/editar");

  // Breadcrumb dinámico
  const getBreadcrumb = () => {
    const items = [
      { label: 'Empleados', path: '/catalogo-empleados', icon: <FiList size={16} /> },
    ];

    if (isRegisterPage) {
      items.push({ label: 'Registrar', path: '/catalogo-empleados/registrar', icon: <FiPlus size={16} /> });
    } else if (isEditPage) {
      items.push({ label: 'Editar', path: location.pathname, icon: <FiPlus size={16} /> });
    }

    return items;
  };

  return (
    <div className="bg-[#f4f7fa] w-full">
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12">
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-1 md:mb-0 text-left">
          Administración de<span className="text-gray-500 font-normal"> empleados</span>
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
          <Route index element={<EmpleadoList />} />
          <Route path="registrar" element={<EmpleadoForm />} />
          <Route path="editar/:id" element={<EmpleadoEdit />} />
        </Routes>
      </div>
    </div>
  );
};

export default EmpleadosPage;
