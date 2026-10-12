import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiDownload, FiPlus, FiEdit, FiFile } from 'react-icons/fi';
import liberacionService, { getDocumentoFilename } from '../../services/liberacionService';
import { buildLiberacionFichaData, generateLiberacionFichaPdf } from '../../utils/liberacionPdfGenerator';
import SearchInput from '../common/SearchInput';

const fmtDate = (value) => {
  if (!value) return '—';
  const str = String(value).slice(0, 10);
  if (!str || str === '—') return '—';
  const parts = str.split('-');
  if (parts.length !== 3) return '—';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const employeeName = (emp) => {
  if (!emp) return '—';
  const nombre = `${emp.nombre || ''} ${emp.apellidos || ''}`.trim();
  return nombre || emp.email || `Empleado #${emp.id}`;
};

const userName = (user) => {
  if (!user) return '—';
  if (typeof user === 'string') return user;
  const nombre = user.nombre_completo || `${user.name || ''} ${user.ap_paterno || ''} ${user.ap_materno || ''}`.trim();
  return nombre || user.email || `Usuario #${user.id}`;
};

const LiberacionList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await liberacionService.getLiberaciones();
      setItems(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la lista de liberaciones.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = useCallback((term) => {
    setSearch(term ?? '');
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      const text = [
        item.id,
        item.numero_control,
        item.nombre_sistema,
        item.lider_proyecto,
        userName(item.lider_proyecto_data),
        item.tipo_liberacion,
        employeeName(item.responsable_infraestructura_data || item.responsable_infraestructura),
        employeeName(item.responsable_desarrollo_data || item.responsable_desarrollo),
        Number(item.estatus) === 1 ? 'abierta' : 'cerrada',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return text.includes(query);
    });
  }, [items, search]);

  const handleDownload = (item) => {
    const ficha = buildLiberacionFichaData(item);
    const fileName = `${(item.nombre_sistema || 'sistema').replace(/\s+/g, '-').toLowerCase()}-ficha-liberacion.pdf`;
    generateLiberacionFichaPdf(ficha, fileName);
  };

  const handleDownloadDocumento = async (item) => {
    try {
      const file = await liberacionService.downloadDocumento(item.id);
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = getDocumentoFilename(item.numero_control || `liberacion-${item.id}`, item.version);
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar el documento PDF adjunto.',
      });
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-[#f3dfe3] bg-white p-5 shadow-[0_18px_45px_rgba(138,32,54,0.08)] ring-1 ring-[#f7e9ea]">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Administración de fichas de liberación</h2>
          <p className="mt-1 text-sm text-gray-600">Listado de liberaciones creadas, cerradas y exportables.</p>
          <p className="mt-2 text-xs font-medium text-[#8A2036]">
            {search.trim()
              ? `${filtered.length} de ${items.length} ficha${items.length === 1 ? '' : 's'}`
              : `${items.length} ficha${items.length === 1 ? '' : 's'}`}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Buscar por número, sistema, líder, tipo o estatus"
            className="sm:min-w-[280px] lg:min-w-[320px]"
          />
          <Link
            to="/fichas-liberacion/registrar"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
          >
            <FiPlus size={16} /> Nueva ficha
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
                <th className="px-3 py-3">No control</th>
                <th className="px-3 py-3">Tipo</th>
                <th className="px-3 py-3">Fecha liberación</th>
                <th className="px-3 py-3">Estatus</th>
                <th className="px-3 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center">
                    <p className="font-semibold text-gray-700">
                      {search.trim() ? 'Sin coincidencias' : 'Sin fichas registradas'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {search.trim()
                        ? 'Prueba con otro número de control, sistema, líder o tipo.'
                        : 'Crea la primera ficha con el botón “Nueva ficha”.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-[#f5e5e7] odd:bg-white even:bg-[#fffaf8] transition-colors hover:bg-[#fff3f2]">
                    <td className="px-3 py-3 font-semibold text-[#2e1f22]">#{item.id}</td>
                    <td className="px-3 py-3">{item.numero_control || '—'}</td>
                    <td className="px-3 py-3">{item.tipo_liberacion || '—'}</td>
                    <td className="px-3 py-3 text-gray-600">{fmtDate(item.fecha_liberacion)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${Number(item.estatus) === 1 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200' : 'bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200'}`}>
                        {Number(item.estatus) === 1 ? 'ABIERTA' : 'CERRADA'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Link
                          to={`/fichas-liberacion/editar/${item.id}`}
                          className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-blue-600/30 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                          title="Editar ficha"
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
                          title="Descargar PDF de ficha"
                        >
                          <FiDownload size={16} />
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100">
                            PDF Ficha
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
    </div>
  );
};

export default LiberacionList;
