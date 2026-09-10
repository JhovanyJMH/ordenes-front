import SolicitudesTable from '../components/solicitudes/SolicitudesTable';

const SolicitudesGeneralPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-extrabold text-gray-800">Solicitudes generales</h1>
      <p className="text-sm text-gray-500">Todas las solicitudes de todos los usuarios del sistema</p>
    </div>
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
      <SolicitudesTable mode="general" />
    </div>
  </div>
);

export default SolicitudesGeneralPage;
