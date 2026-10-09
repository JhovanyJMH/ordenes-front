import { Routes, Route, Link, useParams } from 'react-router-dom';
import LiberacionList from '../components/liberacion/LiberacionList';
import LiberacionForm from '../components/liberacion/LiberacionForm';

const LiberacionFormRoute = () => {
  const { id } = useParams();
  return <LiberacionForm mode={id ? 'edit' : 'create'} editId={id} />;
};

const LiberacionPage = () => {
  return (
    <div className="min-w-0 w-full overflow-x-hidden bg-[#f4f7fa]">
      <div className="w-full min-w-0 rounded-xl bg-white p-4 shadow-lg md:p-8 lg:p-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-left text-3xl font-extrabold text-colorPrimario sm:text-4xl lg:text-5xl">
            Administración de <span className="text-gray-500 font-normal">fichas de liberación</span>
          </h1>

          <div className="flex gap-2 text-sm">
            <Link to="/fichas-liberacion" className="rounded-xl border border-[#8A2036]/30 px-3 py-2 font-medium text-[#8A2036] hover:bg-[#fff7f7]">
              Lista
            </Link>
            <Link to="/fichas-liberacion/registrar" className="rounded-xl bg-[#8A2036] px-3 py-2 font-medium text-white hover:bg-[#6e1729]">
              Nueva ficha
            </Link>
          </div>
        </div>

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
