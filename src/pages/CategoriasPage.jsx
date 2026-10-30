import { Routes, Route, Link, useLocation } from 'react-router-dom';
import CategoriasList from '../components/categorias/CategoriasList';
import CategoriaForm from '../components/categorias/CategoriaForm';
import CategoriaEdit from '../components/categorias/CategoriaEdit';
import ServiciosList from '../components/servicios/ServiciosList';
import ServicioForm from '../components/servicios/ServicioForm';
import ServicioEdit from '../components/servicios/ServicioEdit';
import { FiChevronRight, FiList, FiPlus } from 'react-icons/fi';

const CategoriasPage = () => {
  const location = useLocation();

  const isListPage = location.pathname === "/catalogo-categorias" || location.pathname === "/catalogo-categorias/";
  const isRegisterPage = location.pathname === "/catalogo-categorias/registrar";
  const isEditPage = location.pathname.startsWith("/catalogo-categorias/editar");
  const isServiciosPage = location.pathname.match(/\/catalogo-categorias\/\d+\/servicios$/);

  const getBreadcrumb = () => {
    const items = [
      { label: 'Categorías', path: '/catalogo-categorias', icon: <FiList size={16} /> },
    ];

    if (isRegisterPage) {
      items.push({ label: 'Registrar', path: '/catalogo-categorias/registrar', icon: <FiPlus size={16} /> });
    } else if (isEditPage) {
      items.push({ label: 'Editar', path: location.pathname, icon: <FiPlus size={16} /> });
    } else if (isServiciosPage) {
      items.push({ label: 'Servicios', path: location.pathname, icon: <FiList size={16} /> });
    }

    return items;
  };

  return (
    <div className="bg-[#f4f7fa] w-full">
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12">
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-1 md:mb-0 text-left">
          Administración de<span className="text-gray-500 font-normal"> categorías</span>
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
          <Route index element={<CategoriasList />} />
          <Route path="registrar" element={<CategoriaForm />} />
          <Route path="editar/:id" element={<CategoriaEdit />} />

          {/* Servicios dentro de una categoría */}
          <Route path=":categoriaId/servicios" element={<ServiciosList />} />
          <Route path=":categoriaId/servicios/registrar" element={<ServicioForm />} />
          <Route path=":categoriaId/servicios/editar/:id" element={<ServicioEdit />} />
        </Routes>
      </div>
    </div>
  );
};

export default CategoriasPage;
