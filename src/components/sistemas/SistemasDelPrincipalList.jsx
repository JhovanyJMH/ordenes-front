import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiArrowLeft, FiEdit2, FiPlus, FiSearch } from 'react-icons/fi';
import sistemasService from '../../services/sistemasService';
import sistemasPrincipalesService from '../../services/sistemasPrincipalesService';
import Pagination from '../common/Pagination';

const SistemasDelPrincipalList = () => {
  const { sistemaPrincipalId } = useParams();
  const [sistemaPrincipal, setSistemaPrincipal] = useState(null);
  const [sistemas, setSistemas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      sistemasPrincipalesService.getSistemaPrincipalById(sistemaPrincipalId),
      sistemasService.getSistemas({ page, search, sistema_principal_id: sistemaPrincipalId }),
    ])
      .then(([principal, response]) => {
        if (cancelled) return;
        setSistemaPrincipal(principal);
        setSistemas(response.data);
        setPagination(response);
      })
      .catch((error) => {
        if (!cancelled) {
          Swal.fire({ icon: 'error', title: 'No se pudo cargar el sistema', text: error.response?.data?.message || 'Intenta nuevamente.' });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sistemaPrincipalId, page, search]);

  if (loading) return <div className="p-8 text-center">Cargando sistemas...</div>;

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-colorPrimario">{sistemaPrincipal?.descripcion || 'Sistema principal'}</h2>
          <p className="text-sm text-gray-600">Sistemas, versiones y variantes registrados dentro del sistema principal.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/catalogo-sistemas" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700">
            <FiArrowLeft /> Sistemas
          </Link>
          <Link to="registrar" className="inline-flex items-center gap-2 rounded-lg bg-colorPrimario px-4 py-2.5 font-semibold text-white">
            <FiPlus /> Agregar sistema / versión
          </Link>
        </div>
      </div>
      <div className="relative mb-5">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nombre, siglas o versión"
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-colorPrimario text-white">
            <tr>
              <th className="px-4 py-3">Sistema / variante</th>
              <th className="px-4 py-3">Versión</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sistemas.map((sistema) => (
              <tr key={sistema.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <strong>{sistema.siglas || sistema.nombre}</strong>
                  <div className="text-xs text-gray-500">{sistema.nombre}</div>
                </td>
                <td className="px-4 py-3">{sistema.version || 'Sin versión'}</td>
                <td className="px-4 py-3">{sistema.estado_operativo || 'Sin estado'}</td>
                <td className="px-4 py-3">
                  <Link title="Editar sistema" to={`editar/${sistema.id}`} className="inline-flex items-center gap-1 rounded border border-colorTerciario px-3 py-2 text-colorTerciario">
                    <FiEdit2 /> Editar
                  </Link>
                </td>
              </tr>
            ))}
            {sistemas.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                  No hay sistemas o versiones registrados para este sistema principal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={page}
        lastPage={pagination?.last_page || 1}
        from={pagination?.from}
        to={pagination?.to}
        total={pagination?.total}
        loading={loading}
        onPageChange={setPage}
      />
    </>
  );
};

export default SistemasDelPrincipalList;
