import { Routes, Route } from 'react-router-dom';
import DependenciasList from '../components/dependencias/DependenciasList';
import DependenciaForm from '../components/dependencias/DependenciaForm';
import DependenciaEdit from '../components/dependencias/DependenciaEdit';

const DependenciasPage = () => {
  return (
    <div className="bg-[#f4f7fa] w-full">
      <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-8 lg:p-12">
        <h1 className="text-5xl font-extrabold text-colorPrimario mb-6 text-left">
          Administración de<span className="text-gray-500 font-normal"> dependencias</span>
        </h1>

        <Routes>
          <Route index element={<DependenciasList />} />
          <Route path="registrar" element={<DependenciaForm />} />
          <Route path="editar/:id" element={<DependenciaEdit />} />
        </Routes>
      </div>
    </div>
  );
};

export default DependenciasPage;
