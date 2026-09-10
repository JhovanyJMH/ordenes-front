import { Routes, Route, Link } from 'react-router-dom';
import SolicitudList from '../components/solicitudes/SolicitudList';
import SolicitudForm from '../components/solicitudes/SolicitudForm';
import SolicitudEdit from '../components/solicitudes/SolicitudEdit';

const SolicitudesPage = () => {
  return (
    <div className="min-w-0 w-full overflow-x-hidden bg-[#f4f7fa]">
      <div className="w-full min-w-0 rounded-xl bg-white p-4 shadow-lg md:p-8 lg:p-12">
        <h1 className="mb-6 text-left text-3xl font-extrabold text-colorPrimario sm:text-4xl lg:text-5xl">
          Administración de<span className="text-gray-500 font-normal"> solicitudes</span>
        </h1>

        {/* <nav className="text-sm text-gray-500 flex items-center gap-2 mt-2 justify-start md:justify-end w-full md:w-auto mb-8">
          <Link to="/solicitudes" className="text-colorPrimario font-semibold hover:underline">Lista de solicitudes</Link>
          <span className="mx-1">&gt;</span>
          <Link to="/solicitudes/registrar" className="hover:underline">Registrar solicitud</Link>
        </nav> */}

        <Routes>
          <Route index element={<SolicitudList />} />
          <Route path="registrar" element={<SolicitudForm />} />
          <Route path="editar/:id" element={<SolicitudEdit />} />
        </Routes>
      </div>
    </div>
  );
};

export default SolicitudesPage;
