import { Routes, Route, Link } from 'react-router-dom';
import EmpleadoList from '../components/empleados/EmpleadoList';
import EmpleadoForm from '../components/empleados/EmpleadoForm';
import EmpleadoEdit from '../components/empleados/EmpleadoEdit';

const EmpleadosPage = () => {
  return (
    <div className="bg-[#f4f7fa] w-full">
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12">
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-6 text-left">
          Administración de<span className="text-gray-500 font-normal"> empleados</span>
        </h1>

        <nav className="text-sm text-gray-500 flex items-center gap-2 mt-2 justify-start md:justify-end w-full md:w-auto mb-8">
          <Link to="/catalogo-empleados" className="text-colorPrimario font-semibold hover:underline">Lista de empleados</Link>
          <span className="mx-1">&gt;</span>
          <Link to="/catalogo-empleados/registrar" className="hover:underline">Registrar empleado</Link>
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
