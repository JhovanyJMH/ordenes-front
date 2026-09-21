import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiDownload, FiSearch, FiPlus } from 'react-icons/fi';
import liberacionService from '../../services/liberacionService';
import { buildLiberacionFichaData, generateLiberacionFichaPdf } from '../../utils/liberacionPdfGenerator';

const fmtDate = (value) => {
  if (!value) return '—';
  const d = String(value).slice(0, 10);
  return d;
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

  const filtered = items.filter((item) => {
    const text = `${item.id || ''} ${item.nombre_sistema || ''} ${item.lider_proyecto || ''} ${item.tipo_liberacion || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const handleDownload = (item) => {
    const ficha = buildLiberacionFichaData(item);
    const fileName = `${(item.nombre_sistema || 'sistema').replace(/\s+/g, '-').toLowerCase()}-ficha-liberacion.pdf`;
    generateLiberacionFichaPdf(ficha, fileName);
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = Number(item.estatus) === 1 ? 0 : 1;
    const actionText = nextStatus === 1 ? 'abrir' : 'cerrar';

    const result = await Swal.fire({
      title: `¿${actionText === 'abrir' ? 'Abrir' : 'Cerrar'} ficha?`,
      text: `La ficha ${item.id} pasará a estado ${nextStatus === 1 ? 'ABIERTA' : 'CERRADA'}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await liberacionService.updateLiberacion(item.id, { estatus: nextStatus });
      await loadData();
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La ficha quedó en ${nextStatus === 1 ? 'ABIERTA' : 'CERRADA'}.`,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estatus de la ficha.',
      });
    }
  };

  return (
    <div className="mt-8 rounded-2xl bg-white p-5 shadow-md">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Administración de fichas de liberación</h2>
          <p className="text-sm text-gray-600">Listado de liberaciones creadas, cerradas y exportables.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:max-w-sm">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiSearch className="text-gray-500" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar sistema, líder o tipo"
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <Link
            to="/fichas-liberacion/registrar"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8A2036] to-[#a9354c] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
          >
            <FiPlus size={16} /> Nueva ficha
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-[#8A2036] to-[#a9354c] text-white">
              <tr>
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Sistema</th>
                <th className="px-3 py-3">Líder</th>
                <th className="px-3 py-3">Tipo</th>
                <th className="px-3 py-3">Fecha liberación</th>
                <th className="px-3 py-3">Estatus</th>
                <th className="px-3 py-3">Infraestructura</th>
                <th className="px-3 py-3">Desarrollo</th>
                <th className="px-3 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-gray-500">Sin fichas registradas</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-3 font-semibold">#{item.id}</td>
                    <td className="px-3 py-3">{item.nombre_sistema || '—'}</td>
                    <td className="px-3 py-3">{userName(item.lider_proyecto_data || item.lider_proyecto)}</td>
                    <td className="px-3 py-3">{item.tipo_liberacion || '—'}</td>
                    <td className="px-3 py-3">{fmtDate(item.fecha_liberacion)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${Number(item.estatus) === 1 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200' : 'bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200'}`}>
                        {Number(item.estatus) === 1 ? 'ABIERTA' : 'CERRADA'}
                      </span>
                    </td>
                    <td className="px-3 py-3">{employeeName(item.responsable_infraestructura_data || item.responsable_infraestructura)}</td>
                    <td className="px-3 py-3">{employeeName(item.responsable_desarrollo_data || item.responsable_desarrollo)}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Link
                          to={`/fichas-liberacion/editar/${item.id}`}
                          className="rounded-xl border border-[#8A2036]/30 bg-[#fff7f7] px-2.5 py-1.5 text-[11px] font-bold text-[#8A2036] hover:bg-[#8A2036] hover:text-white"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className="rounded-xl border border-[#8A2036]/30 bg-[#fff7f7] px-2.5 py-1.5 text-[11px] font-bold text-[#8A2036] hover:bg-[#8A2036] hover:text-white"
                        >
                          {Number(item.estatus) === 1 ? 'Cerrar' : 'Abrir'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(item)}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#8A2036]/30 bg-[#fff7f7] px-2.5 py-1.5 text-[11px] font-bold text-[#8A2036] hover:bg-[#8A2036] hover:text-white"
                        >
                          <FiDownload size={12} /> PDF
                        </button>
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
