import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import solicitudesService, { extractErrorMessage } from '../../services/solicitudesService';

export const fetchSolicitudes = createAsyncThunk(
  'solicitudes/fetchSolicitudes',
  async ({ page = 1, per_page = 50, search = '' } = {}, { rejectWithValue }) => {
    try { return await solicitudesService.getSolicitudes({ page, per_page, search }); }
    catch (err) { return rejectWithValue(err?.message || 'Error al obtener solicitudes'); }
  }
);

export const getSolicitudById = createAsyncThunk(
  'solicitudes/getSolicitudById',
  async (id, { rejectWithValue }) => {
    try { return await solicitudesService.getSolicitudById(id); }
    catch (err) { return rejectWithValue(err?.message || 'Error al obtener solicitud'); }
  }
);

export const createSolicitud = createAsyncThunk(
  'solicitudes/createSolicitud',
  async (data, { rejectWithValue }) => {
    try { return await solicitudesService.createSolicitud(data); }
    catch (err) { return rejectWithValue(extractErrorMessage(err) || 'Error al crear solicitud'); }
  }
);

export const updateSolicitud = createAsyncThunk(
  'solicitudes/updateSolicitud',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await solicitudesService.updateSolicitud(id, data); }
    catch (err) { return rejectWithValue(extractErrorMessage(err) || 'Error al actualizar solicitud'); }
  }
);

export const fetchEstadisticas = createAsyncThunk(
  'solicitudes/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try { return await solicitudesService.getEstadisticas(); }
    catch (err) { return rejectWithValue(extractErrorMessage(err) || 'Error al obtener estadísticas'); }
  }
);

const paginatePayload = (payload) => ({
  list: payload.data || [],
  pagination: {
    currentPage: payload.current_page,
    lastPage: payload.last_page,
    perPage: payload.per_page,
    total: payload.total,
    from: payload.from,
    to: payload.to,
  },
});

export const fetchSolicitudesTabla = createAsyncThunk(
  'solicitudes/fetchSolicitudesTabla',
  async ({ page = 1, per_page = 15, search = '' } = {}, { rejectWithValue }) => {
    try { return await solicitudesService.getSolicitudesTabla({ page, per_page, search }); }
    catch (err) { return rejectWithValue(extractErrorMessage(err) || 'Error al obtener solicitudes'); }
  }
);

export const fetchSolicitudesGeneral = createAsyncThunk(
  'solicitudes/fetchSolicitudesGeneral',
  async ({ page = 1, per_page = 25, search = '' } = {}, { rejectWithValue }) => {
    try { return await solicitudesService.getSolicitudesGeneral({ page, per_page, search }); }
    catch (err) { return rejectWithValue(extractErrorMessage(err) || 'Error al obtener solicitudes'); }
  }
);

export const deleteSolicitud = createAsyncThunk(
  'solicitudes/deleteSolicitud',
  async (id, { rejectWithValue }) => {
    try { await solicitudesService.deleteSolicitud(id); return id; }
    catch (err) { return rejectWithValue(err.response?.data?.message || err?.message || 'Error al eliminar solicitud'); }
  }
);

const solicitudesSlice = createSlice({
  name: 'solicitudes',
  initialState: {
    list: [], loading: false, error: null, successMessage: null, selected: null,
    stats: null, statsLoading: false,
    pagination: { currentPage: 1, lastPage: 1, perPage: 50, total: 0, from: 0, to: 0 },
    tabla: { list: [], loading: false, pagination: { currentPage: 1, lastPage: 1, perPage: 15, total: 0, from: 0, to: 0 } },
    general: { list: [], loading: false, pagination: { currentPage: 1, lastPage: 1, perPage: 25, total: 0, from: 0, to: 0 } },
  },
  reducers: {
    clearError: (s) => { s.error = null; },
    clearSuccessMessage: (s) => { s.successMessage = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchSolicitudes.pending, (s)=>{s.loading=true;s.error=null;})
     .addCase(fetchSolicitudes.fulfilled, (s,a)=>{s.loading=false;s.list=a.payload.data||[];s.pagination={currentPage:a.payload.current_page,lastPage:a.payload.last_page,perPage:a.payload.per_page,total:a.payload.total,from:a.payload.from,to:a.payload.to};})
     .addCase(fetchSolicitudes.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(createSolicitud.pending, (s)=>{s.loading=true;s.error=null;})
     .addCase(createSolicitud.fulfilled, (s,a)=>{s.loading=false;s.successMessage='Solicitud creada'; if(a.payload?.id){s.list.unshift(a.payload);} })
     .addCase(createSolicitud.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(updateSolicitud.pending, (s)=>{s.loading=true;s.error=null;})
     .addCase(updateSolicitud.fulfilled, (s,a)=>{s.loading=false;s.successMessage='Solicitud actualizada'; const i=s.list.findIndex(x=>String(x.id)===String(a.payload?.id)); if(i!==-1) s.list[i]=a.payload;})
     .addCase(updateSolicitud.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(getSolicitudById.pending, (s)=>{s.loading=true;s.error=null;s.selected=null;})
     .addCase(getSolicitudById.fulfilled, (s,a)=>{s.loading=false;s.selected=a.payload;})
     .addCase(getSolicitudById.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(deleteSolicitud.pending, (s)=>{s.loading=true;s.error=null;})
     .addCase(deleteSolicitud.fulfilled, (s,a)=>{s.loading=false;s.successMessage='Solicitud eliminada'; s.list=s.list.filter(x=>String(x.id)!==String(a.payload));})
     .addCase(deleteSolicitud.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(fetchEstadisticas.pending, (s)=>{s.statsLoading=true;})
     .addCase(fetchEstadisticas.fulfilled, (s,a)=>{s.statsLoading=false;s.stats=a.payload;})
     .addCase(fetchEstadisticas.rejected, (s,a)=>{s.statsLoading=false;s.error=a.payload;})
     .addCase(fetchSolicitudesTabla.pending, (s)=>{s.tabla.loading=true;})
     .addCase(fetchSolicitudesTabla.fulfilled, (s,a)=>{s.tabla.loading=false; const p=paginatePayload(a.payload); s.tabla.list=p.list; s.tabla.pagination=p.pagination;})
     .addCase(fetchSolicitudesTabla.rejected, (s,a)=>{s.tabla.loading=false;s.error=a.payload;})
     .addCase(fetchSolicitudesGeneral.pending, (s)=>{s.general.loading=true;})
     .addCase(fetchSolicitudesGeneral.fulfilled, (s,a)=>{s.general.loading=false; const p=paginatePayload(a.payload); s.general.list=p.list; s.general.pagination=p.pagination;})
     .addCase(fetchSolicitudesGeneral.rejected, (s,a)=>{s.general.loading=false;s.error=a.payload;});
  }
});

export const { clearError, clearSuccessMessage } = solicitudesSlice.actions;
export default solicitudesSlice.reducer;
