import { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiEdit2, FiPlus, FiSearch, FiServer, FiTrash2 } from 'react-icons/fi';
import sistemasService from '../services/sistemasService';
import adscripcionesService from '../services/adscripcionesService';
import empleadosService from '../services/empleadosService';
import usersService from '../services/usersService';
import SearchModal from '../components/common/SearchModal';

const emptySistema = {
  nombre: '', siglas: '', anio_desarrollo: '', estado_operativo: '',
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
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptySistema);
  const [loading, setLoading] = useState(Boolean(id));
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
    try {
      const payload = { ...form, anio_desarrollo: form.anio_desarrollo || null, es_interoperable: form.es_interoperable === '' ? null : form.es_interoperable === 'true' };
      if (id) await sistemasService.updateSistema(id, payload); else await sistemasService.createSistema(payload);
      await Swal.fire({ icon: 'success', title: id ? 'Sistema actualizado' : 'Sistema creado', timer: 1400, showConfirmButton: false });
      navigate('/catalogo-sistemas');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.response?.data?.message || 'Revisa los datos capturados.' });
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando sistema...</div>;

  return (
    <form onSubmit={submit} className="space-y-6">
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
      <div className="flex justify-end gap-3"><Link to="/catalogo-sistemas" className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700">Cancelar</Link><button className="rounded-lg bg-colorPrimario px-5 py-2.5 font-semibold text-white">Guardar</button></div>
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

const SistemasList = () => {
  const [sistemas, setSistemas] = useState([]);
  const [search, setSearch] = useState('');
  const load = () => sistemasService.getSistemas(search).then(setSistemas);
  useEffect(() => { load(); }, [search]);

  const deactivate = async (id) => {
    const result = await Swal.fire({ title: '¿Desactivar sistema?', text: 'No se eliminará de las fichas históricas.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Desactivar', cancelButtonText: 'Cancelar' });
    if (result.isConfirmed) { await sistemasService.deleteSistema(id); load(); }
  };

  return <>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative flex-1"><FiSearch className="absolute left-3 top-3 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o siglas" className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3" /></div><Link to="registrar" className="inline-flex items-center justify-center gap-2 rounded-lg bg-colorPrimario px-4 py-2.5 font-semibold text-white"><FiPlus /> Nuevo sistema</Link></div>
    <div className="overflow-x-auto rounded-lg border border-gray-200"><table className="min-w-full text-left text-sm"><thead className="bg-colorPrimario text-white"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Sistema</th><th className="px-4 py-3">Versión</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th></tr></thead><tbody>{sistemas.map((sistema) => <tr key={sistema.id} className="border-t hover:bg-gray-50"><td className="px-4 py-3">{sistema.id}</td><td className="px-4 py-3"><strong>{sistema.siglas || sistema.nombre}</strong><div className="text-xs text-gray-500">{sistema.nombre}</div></td><td className="px-4 py-3">{sistema.version || 'Sin versión'}</td><td className="px-4 py-3">{sistema.estado_operativo || 'Sin estado'}</td><td className="px-4 py-3"><div className="flex gap-2"><Link title="Editar" to={`editar/${sistema.id}`} className="rounded border border-colorTerciario p-2 text-colorTerciario"><FiEdit2 /></Link><button title="Desactivar" onClick={() => deactivate(sistema.id)} className="rounded border border-red-300 p-2 text-red-600"><FiTrash2 /></button></div></td></tr>)}</tbody></table></div>
  </>;
};

const SistemasPage = () => <div className="w-full rounded-xl bg-white p-4 shadow-lg md:p-8"><div className="mb-8 flex items-center gap-3"><FiServer className="text-3xl text-colorPrimario" /><div><h1 className="text-3xl font-extrabold text-colorPrimario">Catálogo de sistemas</h1><p className="text-gray-600">Administra la información que se reutiliza en las fichas de liberación.</p></div></div><Routes><Route index element={<SistemasList />} /><Route path="registrar" element={<SistemaForm />} /><Route path="editar/:id" element={<SistemaForm />} /></Routes></div>;

export default SistemasPage;