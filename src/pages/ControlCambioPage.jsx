import { Routes, Route, Link, useParams } from 'react-router-dom';
import ControlCambioList from '../components/controlCambio/ControlCambioList';
import ControlCambioForm from '../components/controlCambio/ControlCambioForm';

const ControlCambioFormRoute = () => {
  const { id } = useParams();
  return <ControlCambioForm mode={id ? 'edit' : 'create'} editId={id} />;
};

const ControlCambioPage = () => {
  return (
    <div className="min-w-0 w-full overflow-x-hidden bg-[#f4f7fa]">
      <div className="w-full min-w-0 rounded-xl bg-white p-4 shadow-lg md:p-8 lg:p-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-left text-3xl font-extrabold text-colorPrimario sm:text-4xl lg:text-5xl">
            Administración de <span className="text-gray-500 font-normal">control de cambios</span>
          </h1>

          <div className="flex gap-2 text-sm">
            <Link to="/control-cambios" className="rounded-xl border border-[#8A2036]/30 px-3 py-2 font-medium text-[#8A2036] hover:bg-[#fff7f7]">
              Lista
            </Link>
            <Link to="/control-cambios/registrar" className="rounded-xl bg-[#8A2036] px-3 py-2 font-medium text-white hover:bg-[#6e1729]">
              Nuevo registro
            </Link>
          </div>
        </div>

        <Routes>
          <Route index element={<ControlCambioList />} />
          <Route path="registrar" element={<ControlCambioFormRoute />} />
          <Route path="editar/:id" element={<ControlCambioFormRoute />} />
        </Routes>
      </div>
    </div>
  );
};

export default ControlCambioPage;
