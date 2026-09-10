import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import serviciosService from '../../services/serviciosService';

export const fetchServicios = createAsyncThunk(
  'servicios/fetchServicios',
  async ({ page = 1, per_page = 50, search = '', categoria_id = null } = {}, { rejectWithValue }) => {
    try { return await serviciosService.getServicios({ page, per_page, search, categoria_id }); }
    catch (err) { return rejectWithValue(err?.message || 'Error al obtener servicios'); }
  }
);

export const getServicioById = createAsyncThunk(
  'servicios/getServicioById',
  async (id, { rejectWithValue }) => {
    try { return await serviciosService.getServicioById(id); }
    catch (err) { return rejectWithValue(err?.message || 'Error al obtener servicio'); }
  }
);

export const createServicio = createAsyncThunk(
  'servicios/createServicio',
  async (data, { rejectWithValue }) => {
    try { return await serviciosService.createServicio(data); }
    catch (err) { return rejectWithValue(err.response?.data?.message || err?.message || 'Error al crear servicio'); }
  }
);

export const updateServicio = createAsyncThunk(
  'servicios/updateServicio',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await serviciosService.updateServicio(id, data); }
    catch (err) { return rejectWithValue(err.response?.data?.message || err?.message || 'Error al actualizar servicio'); }
  }
);

export const deleteServicio = createAsyncThunk(
  'servicios/deleteServicio',
  async (id, { rejectWithValue }) => {
    try { await serviciosService.deleteServicio(id); return id; }
    catch (err) { return rejectWithValue(err.response?.data?.message || err?.message || 'Error al eliminar servicio'); }
  }
);

const serviciosSlice = createSlice({
  name: 'servicios',
  initialState: {
    list: [], loading: false, error: null, successMessage: null, selected: null,
    pagination: { currentPage: 1, lastPage: 1, perPage: 50, total: 0, from: 0, to: 0 },
  },
  reducers: {
    clearError: (s) => { s.error = null; },
    clearSuccessMessage: (s) => { s.successMessage = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchServicios.pending, (s)=>{s.loading=true;s.error=null;})
     .addCase(fetchServicios.fulfilled, (s,a)=>{s.loading=false;s.list=a.payload.data||[];s.pagination={currentPage:a.payload.current_page,lastPage:a.payload.last_page,perPage:a.payload.per_page,total:a.payload.total,from:a.payload.from,to:a.payload.to};})
     .addCase(fetchServicios.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(createServicio.pending, (s)=>{s.loading=true;s.error=null;})
     .addCase(createServicio.fulfilled, (s,a)=>{s.loading=false;s.successMessage='Servicio creado'; if(a.payload?.id){s.list.unshift(a.payload);} })
     .addCase(createServicio.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(updateServicio.pending, (s)=>{s.loading=true;s.error=null;})
     .addCase(updateServicio.fulfilled, (s,a)=>{s.loading=false;s.successMessage='Servicio actualizado'; const i=s.list.findIndex(x=>String(x.id)===String(a.payload?.id)); if(i!==-1) s.list[i]=a.payload;})
     .addCase(updateServicio.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(getServicioById.pending, (s)=>{s.loading=true;s.error=null;s.selected=null;})
     .addCase(getServicioById.fulfilled, (s,a)=>{s.loading=false;s.selected=a.payload;})
     .addCase(getServicioById.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(deleteServicio.pending, (s)=>{s.loading=true;s.error=null;})
     .addCase(deleteServicio.fulfilled, (s,a)=>{s.loading=false;s.successMessage='Servicio eliminado'; s.list=s.list.filter(x=>String(x.id)!==String(a.payload));})
     .addCase(deleteServicio.rejected, (s,a)=>{s.loading=false;s.error=a.payload;});
  }
});

export const { clearError, clearSuccessMessage } = serviciosSlice.actions;
export default serviciosSlice.reducer;
