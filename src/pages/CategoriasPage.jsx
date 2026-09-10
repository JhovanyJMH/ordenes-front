import { Routes, Route, Link } from 'react-router-dom';
import CategoriasList from '../components/categorias/CategoriasList';
import CategoriaForm from '../components/categorias/CategoriaForm';
import CategoriaEdit from '../components/categorias/CategoriaEdit';
import ServiciosList from '../components/servicios/ServiciosList';
import ServicioForm from '../components/servicios/ServicioForm';
import ServicioEdit from '../components/servicios/ServicioEdit';

const CategoriasPage = () => {
  return (
    <div className="bg-[#f4f7fa] w-full">
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12">
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-6 text-left">
          Administración de<span className="text-gray-500 font-normal"> categorías</span>
        </h1>

        <nav className="text-sm text-gray-500 flex items-center gap-2 mt-2 justify-start md:justify-end w-full md:w-auto mb-8">
          <Link to="/catalogo-categorias" className="text-colorPrimario font-semibold hover:underline">Lista de categorías</Link>
          <span className="mx-1">&gt;</span>
          <Link to="/catalogo-categorias/registrar" className="hover:underline">Registrar categoría</Link>
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
