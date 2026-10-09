import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSolicitudes, deleteSolicitud, updateSolicitud } from '../../features/solicitudes/solicitudesSlice';
import { fetchUsers } from '../../features/users/usersSlice';
import { Link } from 'react-router-dom';
import { SearchBar } from '../SearchBar';
import CustomSelect from '../common/CustomSelect';
import Swal from 'sweetalert2';
import solicitudesService from '../../services/solicitudesService';
import { downloadSolicitudPdf } from '../../utils/solicitudPdfGenerator';

const fmtDate = (value) => {
  if (!value) return '—';
  const str = String(value).slice(0, 10);
  if (!str || str === '—') return '—';
  const parts = str.split('-');
  if (parts.length !== 3) return '—';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const SolicitudList = () => {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector((s) => s.solicitudes);
  const { list: users } = useSelector((s) => s.users);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [turnarSolicitudId, setTurnarSolicitudId] = useState(null);
  const [turnarUserId, setTurnarUserId] = useState(null);

  useEffect(() => {
    dispatch(fetchSolicitudes({ page: currentPage, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, search: '' }));
  }, [dispatch]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: '¿Eliminar solicitud?', text: 'Esta acción no se puede deshacer.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#d33' });
    if (result.isConfirmed) {
      try {
        await dispatch(deleteSolicitud(id)).unwrap();
        await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'La solicitud se eliminó correctamente.' });
        dispatch(fetchSolicitudes({ page: currentPage, search: searchTerm }));
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: typeof e === 'string' ? e : 'No se pudo eliminar.' });
      }
    }
  };

  const turnarOptions = users.map((item) => ({
    value: item.id,
    label: item.nombre_completo || `${item.name || ''} ${item.ap_paterno || ''} ${item.ap_materno || ''}`.trim() || item.email,
  }));

  const selectedTurnarValue = turnarOptions.find((opt) => String(opt.value) === String(turnarUserId)) || null;

  const getAssignedName = (sol) => {
    if (sol.user?.nombre_completo) return sol.user.nombre_completo;
    if (sol.user?.name) return `${sol.user.name} ${sol.user.ap_paterno || ''} ${sol.user.ap_materno || ''}`.trim();
    return sol.user?.email || (sol.user_id ? `ID ${sol.user_id}` : '-');
  };

  const openTurnarPanel = (id) => {
    setTurnarSolicitudId(id);
    setTurnarUserId(null);
  };

  const cancelTurnar = () => {
    setTurnarSolicitudId(null);
    setTurnarUserId(null);
  };

  const confirmTurnar = async () => {
    if (!turnarSolicitudId) return;

    if (!turnarUserId) {
      Swal.fire({ icon: 'warning', title: 'Selecciona un usuario', text: 'Debes elegir un usuario del sistema para turnar la solicitud.' });
      return;
    }

    try {
      await dispatch(updateSolicitud({ id: turnarSolicitudId, data: { user_id: Number(turnarUserId) } })).unwrap();
      await Swal.fire({ icon: 'success', title: 'Turnada', text: 'La solicitud se turnó correctamente.' });
      cancelTurnar();
      dispatch(fetchSolicitudes({ page: currentPage, search: searchTerm }));
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: typeof e === 'string' ? e : 'No se pudo turnar la solicitud.' });
    }
  };

  const handleClose = async (id) => {
    const result = await Swal.fire({
      title: 'Cerrar solicitud',
      text: '¿Deseas marcar esta solicitud como cerrada?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      try {
        await dispatch(updateSolicitud({ id, data: { estatus: 0 } })).unwrap();
        await Swal.fire({ icon: 'success', title: 'Cerrada', text: 'La solicitud fue cerrada correctamente.' });
        dispatch(fetchSolicitudes({ page: currentPage, search: searchTerm }));
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: typeof e === 'string' ? e : 'No se pudo cerrar la solicitud.' });
      }
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      Swal.fire({ title: 'Generando PDF...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await downloadSolicitudPdf(id, solicitudesService.getSolicitudById);
      Swal.close();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el PDF.' });
    }
  };

  const handleSearch = (term) => { setSearchTerm(term); setCurrentPage(1); };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-colorPrimario"></div>
      </div>
    );
  }

  return (
    <>
      <SearchBar showButton={false} onSearch={handleSearch} currentPage={currentPage} />
      {turnarSolicitudId && (
        <div className="mb-4 rounded-2xl border border-[#f2dfe3] bg-gradient-to-r from-[#fffaf8] to-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-600">Turnar solicitud</p>
              <p className="text-lg font-semibold text-[#2d1a1d]">Solicitud #{turnarSolicitudId}</p>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">Selecciona un usuario</label>
              <CustomSelect
                options={turnarOptions}
                value={selectedTurnarValue}
                onChange={(option) => setTurnarUserId(option?.value ?? null)}
                isClearable
              />
            </div>
            <div className="mt-2 flex gap-2 sm:mt-0">
              <button type="button" onClick={confirmTurnar} className="rounded-xl bg-colorPrimario px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6d1a2a]">Confirmar</button>
              <button type="button" onClick={cancelTurnar} className="rounded-xl border border-[#e8d4d7] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-[#f7f1f1]">Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <div className="relative w-full overflow-x-auto rounded-2xl border border-[#f3dfe3] bg-white shadow-[0_18px_45px_rgba(138,32,54,0.08)] ring-1 ring-[#f7e9ea]">
        <table className="min-w-full border-separate border-spacing-0 text-left text-xs text-gray-700 sm:text-sm">
          <thead className="bg-gradient-to-r from-[#8A2036] via-[#9d2b42] to-[#a7354c] text-xs font-bold uppercase tracking-[0.14em] text-white">
            <tr>
              <th className="px-3 py-3 sm:px-4">ID</th>
              <th className="px-3 py-3 sm:px-4">Unidad Administrativa</th>
              <th className="px-3 py-3 sm:px-4">Servicio</th>
              <th className="px-3 py-3 sm:px-4">Fecha</th>
              <th className="px-3 py-3 sm:px-4">Estatus</th>
              <th className="px-3 py-3 text-center sm:px-4">Acción</th>
            </tr>
          </thead>
          <tbody className="uppercase text-[10px] sm:text-xs">
            {list.map((sol) => (
              <tr key={sol.id} className="border-b border-[#f5e5e7] bg-white odd:bg-white even:bg-[#fffaf8] transition-colors hover:bg-[#fff3f2]">
                <td className="whitespace-nowrap px-3 py-3 font-bold text-[#2e1f22] sm:px-4">{sol.id}</td>
                <td className="whitespace-nowrap px-3 py-3 text-gray-700 sm:px-4">{sol.adscripcion?.descripcion || sol.adscripcion_descripcion || '-'}</td>
                <td className="whitespace-nowrap px-3 py-3 text-gray-700 sm:px-4">{sol.servicio?.descripcion || sol.servicio_descripcion || '-'}</td>
                <td className="whitespace-nowrap px-3 py-3 text-gray-600 sm:px-4">{fmtDate(sol.fecha)}</td>
                <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${Number(sol.estatus) === 1 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200' : 'bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200'}`}>
                    {Number(sol.estatus) === 1 ? 'ABIERTA' : 'CERRADA'}
                  </span>
                </td>
                <td className="px-3 py-3 text-center sm:px-4">
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <Link to={`editar/${sol.id}`} title="Atender" className="rounded-xl border border-[#8A2036] bg-[#8A2036] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#6d1a2a] focus:outline-none focus:ring-2 focus:ring-[#8A2036]/20 sm:text-xs">Atender</Link>
                    <button onClick={() => openTurnarPanel(sol.id)} title="Turnar" className="rounded-xl border border-[#BC955B] bg-[#BC955B] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#a57d43] focus:outline-none focus:ring-2 focus:ring-[#BC955B]/20 sm:text-xs">Turnar</button>
                    {/* <button onClick={() => handleClose(sol.id)} title="Cerrar" className="rounded-xl border border-[#d8a35b] bg-[#f8eedf] px-2.5 py-1.5 text-[11px] font-semibold text-[#8e5d27] transition hover:bg-[#d8a35b] hover:text-white">Cerrar</button> */}
                    <button onClick={() => handleDownloadPdf(sol.id)} title="Descargar PDF" className="rounded-xl border border-[#8A2036]/30 bg-[#fff7f7] px-2.5 py-1.5 text-[11px] font-bold text-[#8A2036] transition-all duration-200 hover:bg-[#8A2036] hover:text-white hover:shadow-md hover:shadow-[#8A2036]/20 focus:outline-none focus:ring-2 focus:ring-[#8A2036]/20 sm:text-xs">PDF</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-center text-sm text-gray-600 sm:text-left">
          Mostrando <span className="font-medium">{pagination.from || 0}</span> a <span className="font-medium">{pagination.to || 0}</span> de <span className="font-medium">{pagination.total || 0}</span> resultados
        </div>
        {pagination.lastPage > 1 && (
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setCurrentPage((p)=> Math.max(1, p-1))} disabled={currentPage===1} className="rounded-xl border border-[#e8d3d4] bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 transition hover:border-[#8A2036]/30 hover:text-[#8A2036] disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
            {(() => {
              const pages = [];
              const pagesToShow = window.innerWidth < 640 ? 5 : 10;
              let startPage = Math.max(1, currentPage - Math.floor(pagesToShow/2));
              let endPage = Math.min(pagination.lastPage, startPage + pagesToShow - 1);
              if (endPage - startPage + 1 < pagesToShow) {
                startPage = Math.max(1, endPage - pagesToShow + 1);
              }
              if (startPage > 1) { pages.push(1); if (startPage > 2) pages.push('...'); }
              for (let i = startPage; i <= endPage; i++) pages.push(i);
              if (endPage < pagination.lastPage) { if (endPage < pagination.lastPage - 1) pages.push('...'); pages.push(pagination.lastPage); }
              return pages.map((p, idx) => (typeof p === 'number'
                ? <button key={p} onClick={() => setCurrentPage(p)} className={`rounded-xl px-2.5 py-1.5 text-sm font-semibold ${p===currentPage ? 'bg-[#8A2036] text-white shadow-md shadow-[#8A2036]/20' : 'border border-[#e8d3d4] bg-white text-gray-700 hover:border-[#8A2036]/30 hover:text-[#8A2036]'}`}>{p}</button>
                : <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">{p}</span>
              ));
            })()}
            <button onClick={() => setCurrentPage((p)=> Math.min(pagination.lastPage, p+1))} disabled={currentPage===pagination.lastPage} className="rounded-xl border border-[#e8d3d4] bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 transition hover:border-[#8A2036]/30 hover:text-[#8A2036] disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button>
          </div>
        )}
      </div>
    </>
  );
};

export default SolicitudList;
