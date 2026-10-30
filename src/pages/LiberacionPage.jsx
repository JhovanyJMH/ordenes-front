import { Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import LiberacionList from '../components/liberacion/LiberacionList';
import LiberacionForm from '../components/liberacion/LiberacionForm';
import { FiChevronRight, FiFileText, FiPlus } from 'react-icons/fi';

const LiberacionFormRoute = () => {
  const { id } = useParams();
  return <LiberacionForm mode={id ? 'edit' : 'create'} editId={id} />;
};

const LiberacionPage = () => {
  const location = useLocation();

  // Detectar página actual
  const isListPage = location.pathname === "/fichas-liberacion" || location.pathname === "/fichas-liberacion/";
  const isRegisterPage = location.pathname === "/fichas-liberacion/registrar";
  const isEditPage = location.pathname.startsWith("/fichas-liberacion/editar");

  // Breadcrumb dinámico
  const getBreadcrumb = () => {
    const items = [
      { label: 'Fichas de liberación', path: '/fichas-liberacion', icon: <FiFileText size={16} /> },
    ];

    if (isRegisterPage) {
      items.push({ label: 'Registrar', path: '/fichas-liberacion/registrar', icon: <FiPlus size={16} /> });
    } else if (isEditPage) {
      items.push({ label: 'Editar', path: location.pathname, icon: <FiPlus size={16} /> });
    }

    return items;
  };

  return (
    <div className="min-w-0 w-full overflow-x-hidden bg-[#f4f7fa]">
      <div className="w-full min-w-0 rounded-xl bg-white p-4 shadow-lg md:p-8 lg:p-12">
        <h1 className="text-left text-3xl font-extrabold text-colorPrimario mb-1 md:mb-0 sm:text-4xl lg:text-5xl">
          Administración de <span className="text-gray-500 font-normal">fichas de liberación</span>
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
          <Route index element={<LiberacionList />} />
          <Route path="registrar" element={<LiberacionFormRoute />} />
          <Route path="editar/:id" element={<LiberacionFormRoute />} />
        </Routes>
      </div>
    </div>
  );
};

export default LiberacionPage;
