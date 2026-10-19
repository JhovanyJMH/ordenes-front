import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiDownload, FiPlus, FiEdit, FiFile } from 'react-icons/fi';
import controlCambioService, { getDocumentoFilename } from '../../services/controlCambioService';
import { buildControlCambioData, generateControlCambioPdf } from '../../utils/controlCambioPdfGenerator';
import SearchInput from '../common/SearchInput';
import Pagination from '../common/Pagination';

const fmtDate = (value) => {
  if (!value) return '—';
  const str = String(value).slice(0, 10);
  if (!str || str === '—') return '—';
  const parts = str.split('-');
  if (parts.length !== 3) return '—';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const ControlCambioList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
    total: 0,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await controlCambioService.getAll({ page: currentPage, search });
      setItems(Array.isArray(data) ? data : data?.data || []);
      setPagination({
        currentPage: data?.current_page || 1,
        lastPage: data?.last_page || 1,
        from: data?.from || 0,
        to: data?.to || 0,
        total: data?.total || 0,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el listado de control de cambios.',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = useCallback((term) => {
    setSearch(term ?? '');
    setCurrentPage(1);
  }, []);

  const handleDownload = (item) => {
    const ficha = buildControlCambioData(item);
    const fileName = `${(item.numero_control || item.nombre_sistema || 'control-cambios').replace(/\s+/g, '-').toLowerCase()}.pdf`;
    generateControlCambioPdf(ficha, fileName);
  };

  const handleDownloadDocumento = async (item) => {
    try {
      const file = await controlCambioService.downloadDocumento(item.id);
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = getDocumentoFilename(item.numero_control || `control-cambios-${item.id}`);
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar el PDF adjunto.',
      });
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-[#f3dfe3] bg-white p-5 shadow-[0_18px_45px_rgba(138,32,54,0.08)] ring-1 ring-[#f7e9ea]">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Control de cambios</h2>
          <p className="mt-1 text-sm text-gray-600">Registros de solicitud, análisis, implementación y autorización.</p>
          <p className="mt-2 text-xs font-medium text-[#8A2036]">
            {pagination.total} registro{pagination.total === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Buscar por número, sistema, tipo o estatus"
            className="sm:min-w-[280px] lg:min-w-[320px]"
          />
          <Link
            to="/control-cambios/registrar"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
          >
            <FiPlus size={16} /> Nuevo registro
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#8A2036] border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#f3dfe3]">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-gradient-to-r from-[#8A2036] via-[#9d2b42] to-[#a7354c] text-xs font-bold uppercase tracking-[0.12em] text-white">
              <tr>
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">No. control</th>
                <th className="px-3 py-3">Tipo</th>
                <th className="px-3 py-3">Fecha solicitud</th>
                <th className="px-3 py-3">Estatus</th>
                <th className="px-3 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center">
                    <p className="font-semibold text-gray-700">
                      {search.trim() ? 'Sin coincidencias' : 'Sin registros'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {search.trim()
                        ? 'Prueba con otro número de control, sistema o tipo.'
                        : 'Crea el primer control de cambios con el botón “Nuevo registro”.'}
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-[#f5e5e7] odd:bg-white even:bg-[#fffaf8] transition-colors hover:bg-[#fff3f2]">
                    <td className="px-3 py-3 font-semibold text-[#2e1f22]">#{item.id}</td>
                    <td className="px-3 py-3">{item.numero_control || '—'}</td>
                    <td className="px-3 py-3">{item.tipo_cambio || '—'}</td>
                    <td className="px-3 py-3 text-gray-600">{fmtDate(item.fecha_solicitud)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${Number(item.estatus) === 1 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200' : 'bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200'}`}>
                        {Number(item.estatus) === 1 ? 'ABIERTO' : 'CERRADO'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Link
                          to={`/control-cambios/editar/${item.id}`}
                          className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-blue-600/30 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                          title="Editar registro"
                        >
                          <FiEdit size={16} />
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100">
                            Editar
                          </span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDownload(item)}
                          className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#8A2036]/30 bg-[#fff7f7] text-[#8A2036] hover:bg-[#8A2036] hover:text-white"
                          title="Descargar PDF de control"
                        >
                          <FiDownload size={16} />
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100">
                            PDF
                          </span>
                        </button>
                        {item.tiene_documento_pdf && (
                          <button
                            type="button"
                            onClick={() => handleDownloadDocumento(item)}
                            className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-700/30 bg-emerald-50 text-emerald-800 hover:bg-emerald-700 hover:text-white"
                            title="Descargar documento adjunto"
                          >
                            <FiFile size={16} />
                            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100">
                              Adjunto
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        lastPage={pagination.lastPage}
        from={pagination.from}
        to={pagination.to}
        total={pagination.total}
        loading={loading}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ControlCambioList;
