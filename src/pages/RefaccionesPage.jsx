import { Routes, Route, Link } from 'react-router-dom';
import RefaccionesList from '../components/refacciones/RefaccionesList';
import RefaccionForm from '../components/refacciones/RefaccionForm';
import RefaccionEdit from '../components/refacciones/RefaccionEdit';

const RefaccionesPage = () => {
  return (
    <div className="bg-[#f4f7fa] w-full">
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12">
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-6 text-left">
          Administración de<span className="text-gray-500 font-normal"> refacciones</span>
        </h1>

        <nav className="text-sm text-gray-500 flex items-center gap-2 mt-2 justify-start md:justify-end w-full md:w-auto mb-8">
          <Link to="/catalogo-refacciones" className="text-colorPrimario font-semibold hover:underline">Lista de refacciones</Link>
          <span className="mx-1">&gt;</span>
          <Link to="/catalogo-refacciones/registrar" className="hover:underline">Registrar refacción</Link>
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
