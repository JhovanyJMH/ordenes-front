import { Routes, Route, Link } from 'react-router-dom';
import {
  SistemasList,
  SistemasDelPrincipalList,
  SistemaPrincipalForm,
  SistemaPrincipalEdit,
  SistemaForm,
  SistemaEdit,
} from '../components/sistemas';

const SistemasPage = () => {
  return (
    <div className="min-w-0 w-full overflow-x-hidden bg-[#f4f7fa]">
      <div className="w-full min-w-0 rounded-xl bg-white p-4 shadow-lg md:p-8 lg:p-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-left text-3xl font-extrabold text-colorPrimario sm:text-4xl lg:text-5xl">
            Catálogo de <span className="font-normal text-gray-500">sistemas</span>
          </h1>

          <div className="flex gap-2 text-sm">
            <Link to="/catalogo-sistemas" className="rounded-xl border border-[#8A2036]/30 px-3 py-2 font-medium text-[#8A2036] hover:bg-[#fff7f7]">
              Lista
            </Link>
            <Link to="/catalogo-sistemas/registrar" className="rounded-xl bg-[#8A2036] px-3 py-2 font-medium text-white hover:bg-[#6e1729]">
              Nuevo sistema principal
            </Link>
          </div>
        </div>

        <Routes>
          <Route index element={<SistemasList />} />
          <Route path="registrar" element={<SistemaPrincipalForm />} />
          <Route path="editar/:id" element={<SistemaPrincipalEdit />} />
          <Route path=":sistemaPrincipalId/sistemas" element={<SistemasDelPrincipalList />} />
          <Route path=":sistemaPrincipalId/sistemas/registrar" element={<SistemaForm />} />
          <Route path=":sistemaPrincipalId/sistemas/editar/:id" element={<SistemaEdit />} />
        </Routes>
      </div>
    </div>
  );
};

export default SistemasPage;
