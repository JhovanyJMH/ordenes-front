import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiArrowLeft, FiEdit2, FiLayers, FiPlus, FiSearch, FiServer, FiTrash2 } from 'react-icons/fi';
import sistemasService from '../services/sistemasService';
import sistemasPrincipalesService from '../services/sistemasPrincipalesService';
import adscripcionesService from '../services/adscripcionesService';
import empleadosService from '../services/empleadosService';
import usersService from '../services/usersService';
import SearchModal from '../components/common/SearchModal';
import SubmitButton from '../components/common/SubmitButton';

const emptySistema = {
  nombre: '', siglas: '', anio_desarrollo: '', estado_operativo: '',
  sistema_principal_id: '',
  nivel_impacto: '', version: '', url: '', ambiente_despliegue: '', tipo_infraestructura: '',
  tipo_sistema: '', adscripcion_id: '', adscripcion_nombre: '', enlace_empleado_id: '', enlace_empleado_nombre: '', lider_administrador_id: '', lider_administrador_nombre: '',
  objetivo: '', descripcion_funcional: '', principales_modulos: '', lenguaje_desarrollo: '',
  fecha_conclusion_desarrollo: '', fecha_liberacion_produccion: '', ultima_actualizacion: '',
  plataforma_desarrollo: '', arquitectura: '', cuenta_codigo_fuente: '',
  repositorio_codigo: '', cuenta_documentacion_tecnica: '', actualizacion_documentacion: '', observaciones: '',
  es_interoperable: '', activo: true,
  alcance: '', framework: '', gestor_base_datos: '',
};

const fields = [
  ['anio_desarrollo', 'Año de Desarrollo'],
  ['nombre', 'Nombre del sistema', true],
  ['siglas', 'Nombre corto / siglas'],
  ['estado_operativo', 'Estado operativo del sistema'],
  ['nivel_impacto', 'Nivel de impacto operativo'],
  ['version', 'Versión'],
  ['tipo_sistema', 'Tipo de sistema'],
  ['url', 'URL'],
  ['ambiente_despliegue', 'Ambiente de despliegue'],
  ['tipo_infraestructura', 'Tipo de infraestructura'],
  ['fecha_conclusion_desarrollo', 'Fecha de conclusión del desarrollo'],
  ['fecha_liberacion_produccion', 'Fecha de Liberación a Producción'],
  ['ultima_actualizacion', 'Última actualización'],
];

const SistemaForm = () => {
  const { id, sistemaPrincipalId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptySistema);
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [modals, setModals] = useState({
    adscripcion: false,
    enlace_empleado: false,
    lider_administrador: false,
  });

  useEffect(() => {
    if (!id) return;
    sistemasService.getSistemaById(id).then((data) => {
      setForm({
        ...emptySistema,
        ...data,
        es_interoperable: data.es_interoperable == null ? '' : String(Boolean(data.es_interoperable)),
        adscripcion_nombre: data.adscripcion?.descripcion || '',
        enlace_empleado_nombre: data.enlace_empleado ? `${data.enlace_empleado.nombre || ''} ${data.enlace_empleado.apellidos || ''}`.trim() : '',
        lider_administrador_nombre: data.lider_administrador ? (data.lider_administrador.nombre_completo || `${data.lider_administrador.name || ''} ${data.lider_administrador.ap_paterno || ''} ${data.lider_administrador.ap_materno || ''}`.trim()) : '',
      });
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!sistemaPrincipalId || id) return;
    sistemasPrincipalesService.getSistemaPrincipalById(sistemaPrincipalId).then((sistemaPrincipal) => {
      setForm((current) => ({ ...current, sistema_principal: sistemaPrincipal }));
    }).catch((error) => {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar el sistema principal', text: error.response?.data?.message || 'Intenta nuevamente.' });
    });
  }, [id, sistemaPrincipalId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const openModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  };

  const handleAdscripcionSelect = (option) => {
    setForm((prev) => ({
      ...prev,
      adscripcion_id: option?.value || '',
      adscripcion_nombre: option?.label || '',
    }));
  };

  const handleEnlaceEmpleadoSelect = (option) => {
    setForm((prev) => ({
      ...prev,
      enlace_empleado_id: option?.value || '',
      enlace_empleado_nombre: option?.label || '',
    }));
  };

  const handleLiderAdministradorSelect = (option) => {
    setForm((prev) => ({
      ...prev,
      lider_administrador_id: option?.value || '',
      lider_administrador_nombre: option?.label || '',
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const payload = { ...form, sistema_principal_id: sistemaPrincipalId || form.sistema_principal_id, anio_desarrollo: form.anio_desarrollo || null, es_interoperable: form.es_interoperable === '' ? null : form.es_interoperable === 'true' };
      if (id) await sistemasService.updateSistema(id, payload); else await sistemasService.createSistema(payload);
      await Swal.fire({ icon: 'success', title: id ? 'Sistema actualizado' : 'Sistema creado', timer: 1400, showConfirmButton: false });
      navigate(sistemaPrincipalId ? `/catalogo-sistemas/${sistemaPrincipalId}/sistemas` : '/catalogo-sistemas');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.response?.data?.message || 'Revisa los datos capturados.' });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando sistema...</div>;

  return (
    <form onSubmit={submit} className="space-y-6">
      {sistemaPrincipalId && (
        <div className="rounded-lg border border-colorPrimario/20 bg-colorPrimario/5 px-4 py-3 text-sm text-gray-700">
          Registrando un sistema para <strong>{form.sistema_principal?.descripcion || `#${sistemaPrincipalId}`}</strong>. Los datos se guardan en su ficha individual.
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {fields.map(([name, label, required]) => (
          <label key={name} className={name === 'url' || name === 'unidad_responsable' || name === 'framework' ? 'lg:col-span-2' : ''}>
            <span className="mb-1 block text-sm font-semibold text-gray-700">{label}{required && <span className="text-red-500"> *</span>}</span>
            <input name={name} required={required} value={form[name] || ''} onChange={handleChange} type={name === 'anio_desarrollo' ? 'number' : 'text'} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-colorPrimario focus:outline-none focus:ring-2 focus:ring-colorPrimario/20" />
          </label>
        ))}
        <div className="md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-gray-700">Unidad Administrativa responsable del sistema</span>
          <div className="flex gap-2">
            <input type="text" value={form.adscripcion_nombre} readOnly placeholder="Buscar adscripción..." className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5" onClick={() => openModal('adscripcion')} />
            <button type="button" onClick={() => openModal('adscripcion')} className="rounded-lg bg-colorPrimario px-4 py-2.5 text-white"><FiSearch /></button>
          </div>
        </div>
        <div className="md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-gray-700">Enlace de la Unidad Administrativa</span>
          <div className="flex gap-2">
            <input type="text" value={form.enlace_empleado_nombre} readOnly placeholder="Buscar empleado..." className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5" onClick={() => openModal('enlace_empleado')} />
            <button type="button" onClick={() => openModal('enlace_empleado')} className="rounded-lg bg-colorPrimario px-4 py-2.5 text-white"><FiSearch /></button>
          </div>
        </div>
        <div className="md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-gray-700">Líder o Administrador del sistema</span>
          <div className="flex gap-2">
            <input type="text" value={form.lider_administrador_nombre} readOnly placeholder="Buscar usuario..." className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5" onClick={() => openModal('lider_administrador')} />
            <button type="button" onClick={() => openModal('lider_administrador')} className="rounded-lg bg-colorPrimario px-4 py-2.5 text-white"><FiSearch /></button>
          </div>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ['objetivo', 'Objetivo'], ['descripcion_funcional', 'Descripción funcional del sistema'], ['principales_modulos', 'Principales módulos'],
        ].map(([name, label]) => <label key={name}><span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span><textarea name={name} value={form[name] || ''} onChange={handleChange} rows={7} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-colorPrimario focus:outline-none focus:ring-2 focus:ring-colorPrimario/20" /></label>)}
      </div>
      <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Alcance del sistema</span><textarea name="alcance" value={form.alcance || ''} onChange={handleChange} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[
          ['plataforma_desarrollo', 'Plataforma de desarrollo'],
          ['arquitectura', 'Arquitectura del sistema'],
          ['cuenta_codigo_fuente', '¿Cuenta con código fuente?'],
          ['repositorio_codigo', 'Repositorio del código'],
          ['cuenta_documentacion_tecnica', '¿Cuenta con documentación técnica?'],
          ['actualizacion_documentacion', 'Actualización de documentación'],
          ['lenguaje_desarrollo', 'Lenguaje de desarrollo'],
          ['framework', 'Framework (si aplica)'],
          ['gestor_base_datos', 'Gestor de Base de Datos'],
        ].map(([name, label]) => (
          <label key={name}>
            <span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span>
            <input name={name} value={form[name] || ''} onChange={handleChange} type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-colorPrimario focus:outline-none focus:ring-2 focus:ring-colorPrimario/20" />
          </label>
        ))}
      </div>
      <label>
        <span className="mb-1 block text-sm font-semibold text-gray-700">¿Es interoperable?</span>
        <select name="es_interoperable" value={form.es_interoperable} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2.5">
          <option value="">Sin especificar</option><option value="true">Sí</option><option value="false">No</option>
        </select>
      </label>
      <label className="block"><span className="mb-1 block text-sm font-semibold text-gray-700">Observaciones</span><textarea name="observaciones" value={form.observaciones || ''} onChange={handleChange} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
      <label className="flex items-center gap-3 pt-7 text-sm font-semibold text-gray-700"><input type="checkbox" name="activo" checked={Boolean(form.activo)} onChange={handleChange} /> Sistema activo</label>
      <div className="flex justify-end gap-3"><Link to="/catalogo-sistemas" className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700">Cancelar</Link><SubmitButton loading={submitting}>Guardar</SubmitButton></div>
      <SearchModal
        isOpen={modals.adscripcion}
        onClose={() => closeModal('adscripcion')}
        title="Buscar adscripción"
        searchFunction={adscripcionesService.filtrado}
        onSelect={handleAdscripcionSelect}
        labelFormatter={(item) => item.descripcion}
      />
      <SearchModal
        isOpen={modals.enlace_empleado}
        onClose={() => closeModal('enlace_empleado')}
        title="Buscar empleado"
        searchFunction={empleadosService.filtrado}
        onSelect={handleEnlaceEmpleadoSelect}
        labelFormatter={(item) => `${item.nombre || ''} ${item.apellidos || ''}`.trim()}
      />
      <SearchModal
        isOpen={modals.lider_administrador}
        onClose={() => closeModal('lider_administrador')}
        title="Buscar usuario"
        searchFunction={usersService.filtrado}
        onSelect={handleLiderAdministradorSelect}
        labelFormatter={(item) => item.nombre_completo || `${item.name || ''} ${item.ap_paterno || ''} ${item.ap_materno || ''}`.trim()}
      />
    </form>
  );
};

const SistemaPrincipalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ descripcion: '', estatus: '1' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    sistemasPrincipalesService.getSistemaPrincipalById(id)
      .then((principal) => setForm({ descripcion: principal.descripcion, estatus: String(principal.estatus) }))
      .catch((error) => Swal.fire({ icon: 'error', title: 'No se pudo cargar el sistema principal', text: error.response?.data?.message || 'Intenta nuevamente.' }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      if (id) await sistemasPrincipalesService.updateSistemaPrincipal(id, form);
      else await sistemasPrincipalesService.createSistemaPrincipal(form);
      await Swal.fire({ icon: 'success', title: id ? 'Sistema principal actualizado' : 'Sistema principal creado', timer: 1400, showConfirmButton: false });
      navigate('/catalogo-sistemas');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.response?.data?.message || 'Revisa los datos capturados.' });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando sistema principal...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white shadow-lg">
        <div className="bg-gradient-to-r from-[#8A2036] to-[#6B1829] px-6 py-4">
          <h2 className="text-xl font-semibold text-white">{id ? 'Editar sistema principal' : 'Registrar sistema principal'}</h2>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-semibold text-gray-700">Nombre del sistema principal <span className="text-red-500">*</span></span>
            <input name="descripcion" value={form.descripcion} onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))} required maxLength={255} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-colorPrimario focus:outline-none focus:ring-2 focus:ring-colorPrimario/20" placeholder="Ej. Sistema de Almacén" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold text-gray-700">Estatus</span>
            <select name="estatus" value={form.estatus} onChange={(event) => setForm((current) => ({ ...current, estatus: event.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2.5">
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Link to="/catalogo-sistemas" className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700">Cancelar</Link>
        <SubmitButton loading={submitting}>Guardar</SubmitButton>
      </div>
    </form>
  );
};

const SistemasList = () => {
  const [sistemasPrincipales, setSistemasPrincipales] = useState([]);
  const [search, setSearch] = useState('');
  const load = useCallback(() => sistemasPrincipalesService.getSistemasPrincipales(search).then(setSistemasPrincipales), [search]);
  useEffect(() => { load(); }, [load]);

  const deactivate = async (id) => {
    const result = await Swal.fire({ title: '¿Eliminar sistema principal?', text: 'Solo se puede eliminar si no tiene sistemas o versiones registrados.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' });
    if (result.isConfirmed) {
      try {
        await sistemasPrincipalesService.deleteSistemaPrincipal(id);
        load();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: error.response?.data?.message || 'El sistema principal tiene registros relacionados.' });
      }
    }
  };

  return <>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1"><FiSearch className="absolute left-3 top-3 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar sistema principal" className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3" /></div>
      <Link to="registrar" className="inline-flex items-center justify-center gap-2 rounded-lg bg-colorPrimario px-4 py-2.5 font-semibold text-white"><FiPlus /> Nuevo sistema principal</Link>
    </div>
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-colorPrimario text-white"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Sistema principal</th><th className="px-4 py-3">Sistemas / versiones</th><th className="px-4 py-3">Estatus</th><th className="px-4 py-3">Acciones</th></tr></thead>
        <tbody>{sistemasPrincipales.map((principal) => (
          <tr key={principal.id} className="border-t hover:bg-gray-50">
            <td className="px-4 py-3">{principal.id}</td>
            <td className="px-4 py-3 font-semibold">{principal.descripcion}</td>
            <td className="px-4 py-3">{principal.sistemas_count}</td>
            <td className="px-4 py-3">{Number(principal.estatus) === 1 ? 'Activo' : 'Inactivo'}</td>
            <td className="px-4 py-3"><div className="flex gap-2">
              <Link title="Administrar sistemas y versiones" to={`${principal.id}/sistemas`} className="inline-flex items-center gap-1 rounded border border-colorPrimario px-2 py-2 text-colorPrimario"><FiLayers /> Sistemas</Link>
              <Link title="Editar sistema principal" to={`editar/${principal.id}`} className="rounded border border-colorTerciario p-2 text-colorTerciario"><FiEdit2 /></Link>
              <button title="Eliminar sistema principal" onClick={() => deactivate(principal.id)} className="rounded border border-red-300 p-2 text-red-600"><FiTrash2 /></button>
            </div></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </>;
};

const SistemasDelPrincipalList = () => {
  const { sistemaPrincipalId } = useParams();
  const [sistemaPrincipal, setSistemaPrincipal] = useState(null);
  const [sistemas, setSistemas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([sistemasPrincipalesService.getSistemaPrincipalById(sistemaPrincipalId), sistemasService.getSistemas()])
      .then(([principal, todosSistemas]) => {
        setSistemaPrincipal(principal);
        setSistemas(todosSistemas.filter((sistema) => String(sistema.sistema_principal_id) === String(sistemaPrincipalId)));
      })
      .catch((error) => {
        Swal.fire({ icon: 'error', title: 'No se pudo cargar el sistema', text: error.response?.data?.message || 'Intenta nuevamente.' });
      })
      .finally(() => setLoading(false));
  }, [sistemaPrincipalId]);

  const sistemasFiltrados = sistemas.filter((sistema) => (
    `${sistema.nombre || ''} ${sistema.siglas || ''} ${sistema.version || ''}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  ));

  if (loading) return <div className="p-8 text-center">Cargando sistemas...</div>;

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-colorPrimario">{sistemaPrincipal?.descripcion || 'Sistema principal'}</h2>
          <p className="text-sm text-gray-600">Sistemas, versiones y variantes registrados dentro del sistema principal.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/catalogo-sistemas" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700"><FiArrowLeft /> Sistemas</Link>
          <Link to="registrar" className="inline-flex items-center gap-2 rounded-lg bg-colorPrimario px-4 py-2.5 font-semibold text-white"><FiPlus /> Agregar sistema / versión</Link>
        </div>
      </div>
      <div className="relative mb-5">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, siglas o versión" className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3" />
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-colorPrimario text-white"><tr><th className="px-4 py-3">Sistema / variante</th><th className="px-4 py-3">Versión</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th></tr></thead>
          <tbody>
            {sistemasFiltrados.map((sistema) => (
              <tr key={sistema.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3"><strong>{sistema.siglas || sistema.nombre}</strong><div className="text-xs text-gray-500">{sistema.nombre}</div></td>
                <td className="px-4 py-3">{sistema.version || 'Sin versión'}</td>
                <td className="px-4 py-3">{sistema.estado_operativo || 'Sin estado'}</td>
                <td className="px-4 py-3"><Link title="Editar sistema" to={`editar/${sistema.id}`} className="inline-flex items-center gap-1 rounded border border-colorTerciario px-3 py-2 text-colorTerciario"><FiEdit2 /> Editar</Link></td>
              </tr>
            ))}
            {sistemasFiltrados.length === 0 && <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">No hay sistemas o versiones registrados para este sistema principal.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
};

const SistemasPage = () => <div className="w-full rounded-xl bg-white p-4 shadow-lg md:p-8"><div className="mb-8 flex items-center gap-3"><FiServer className="text-3xl text-colorPrimario" /><div><h1 className="text-3xl font-extrabold text-colorPrimario">Catálogo de sistemas</h1><p className="text-gray-600">Administra sistemas principales y sus registros/versiones.</p></div></div><Routes><Route index element={<SistemasList />} /><Route path="registrar" element={<SistemaPrincipalForm />} /><Route path="editar/:id" element={<SistemaPrincipalForm />} /><Route path=":sistemaPrincipalId/sistemas" element={<SistemasDelPrincipalList />} /><Route path=":sistemaPrincipalId/sistemas/registrar" element={<SistemaForm />} /><Route path=":sistemaPrincipalId/sistemas/editar/:id" element={<SistemaForm />} /></Routes></div>;

export default SistemasPage;