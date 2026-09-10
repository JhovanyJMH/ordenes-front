import { Routes, Route, Link } from 'react-router-dom';
import EquiposList from '../components/equipos/EquiposList';
import EquipoForm from '../components/equipos/EquipoForm';
import EquipoEdit from '../components/equipos/EquipoEdit';

const EquiposPage = () => {
  return (
    <div className="bg-[#f4f7fa] w-full">
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12">
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-6 text-left">
          Administración de<span className="text-gray-500 font-normal"> equipos</span>
        </h1>

        <nav className="text-sm text-gray-500 flex items-center gap-2 mt-2 justify-start md:justify-end w-full md:w-auto mb-8">
          <Link to="/catalogo-equipos" className="text-colorPrimario font-semibold hover:underline">Lista de equipos</Link>
          <span className="mx-1">&gt;</span>
          <Link to="/catalogo-equipos/registrar" className="hover:underline">Registrar equipo</Link>
        </nav>

        <Routes>
          <Route index element={<EquiposList />} />
          <Route path="registrar" element={<EquipoForm />} />
          <Route path="editar/:id" element={<EquipoEdit />} />
        </Routes>
      </div>
    </div>
  );
};

export default EquiposPage;
