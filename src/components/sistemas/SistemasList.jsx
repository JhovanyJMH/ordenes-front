import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiEdit2, FiLayers, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import sistemasPrincipalesService from '../../services/sistemasPrincipalesService';
import sistemasService from '../../services/sistemasService';
import Pagination from '../common/Pagination';
import SistemasExport from './SistemasExport';

const SistemasList = () => {
  const [sistemasPrincipales, setSistemasPrincipales] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sistemasData, setSistemasData] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sistemasPrincipalesService.getSistemasPrincipales({ page, search });
      setSistemasPrincipales(response.data);
      setPagination(response);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar el catálogo', text: error.response?.data?.message || 'Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const loadSistemasForExport = async () => {
    if (sistemasData.length > 0) return sistemasData; // Already loaded
    try {
      const data = await sistemasService.getReporte();
      setSistemasData(data);
      return data;
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar los datos', text: error.response?.data?.message || 'Intenta nuevamente.' });
      return [];
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const deactivate = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar sistema principal?',
      text: 'Solo se puede eliminar si no tiene sistemas o versiones registrados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await sistemasPrincipalesService.deleteSistemaPrincipal(id);
      await load();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo eliminar',
        text: error.response?.data?.message || 'El sistema principal tiene registros relacionados.',
      });
    }
  };

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar sistema principal"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3"
          />
        </div>
        <div className="flex gap-2">
          <SistemasExport sistemas={sistemasData} onLoad={loadSistemasForExport} />
          <Link to="registrar" className="inline-flex items-center justify-center gap-2 rounded-lg bg-colorPrimario px-4 py-2.5 font-semibold text-white">
            <FiPlus /> Nuevo sistema principal
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-colorPrimario text-white">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Sistema principal</th>
              <th className="px-4 py-3">Sistemas / versiones</th>
              <th className="px-4 py-3">Estatus</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Cargando sistemas principales...
                </td>
              </tr>
            ) : (
              sistemasPrincipales.map((principal) => (
                <tr key={principal.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{principal.id}</td>
                  <td className="px-4 py-3 font-semibold">{principal.descripcion}</td>
                  <td className="px-4 py-3">{principal.sistemas_count}</td>
                  <td className="px-4 py-3">{Number(principal.estatus) === 1 ? 'Activo' : 'Inactivo'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link title="Administrar sistemas y versiones" to={`${principal.id}/sistemas`} className="inline-flex items-center gap-1 rounded border border-colorPrimario px-2 py-2 text-colorPrimario">
                        <FiLayers /> Sistemas
                      </Link>
                      <Link title="Editar sistema principal" to={`editar/${principal.id}`} className="rounded border border-colorTerciario p-2 text-colorTerciario">
                        <FiEdit2 />
                      </Link>
                      <button title="Eliminar sistema principal" onClick={() => deactivate(principal.id)} className="rounded border border-red-300 p-2 text-red-600">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!loading && sistemasPrincipales.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No hay sistemas principales registrados.
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

export default SistemasList;
