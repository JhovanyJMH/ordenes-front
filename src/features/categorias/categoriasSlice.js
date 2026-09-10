import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoriasService from '../../services/categoriasService';

export const fetchCategorias = createAsyncThunk(
  'categorias/fetchCategorias',
  async ({ page = 1, per_page = 50, search = '' } = {}, { rejectWithValue }) => {
    try { return await categoriasService.getCategorias({ page, per_page, search }); }
    catch (err) { return rejectWithValue(err?.message || 'Error al obtener categorías'); }
  }
);

export const getCategoriaById = createAsyncThunk(
  'categorias/getCategoriaById',
  async (id, { rejectWithValue }) => {
    try { return await categoriasService.getCategoriaById(id); }
    catch (err) { return rejectWithValue(err?.message || 'Error al obtener categoría'); }
  }
);

export const createCategoria = createAsyncThunk(
  'categorias/createCategoria',
  async (data, { rejectWithValue }) => {
    try { return await categoriasService.createCategoria(data); }
    catch (err) { return rejectWithValue(err.response?.data?.message || err?.message || 'Error al crear categoría'); }
  }
);

export const updateCategoria = createAsyncThunk(
  'categorias/updateCategoria',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await categoriasService.updateCategoria(id, data); }
    catch (err) { return rejectWithValue(err.response?.data?.message || err?.message || 'Error al actualizar categoría'); }
  }
);

export const deleteCategoria = createAsyncThunk(
  'categorias/deleteCategoria',
  async (id, { rejectWithValue }) => {
    try { await categoriasService.deleteCategoria(id); return id; }
    catch (err) { return rejectWithValue(err.response?.data?.message || err?.message || 'Error al eliminar categoría'); }
  }
);

const categoriasSlice = createSlice({
  name: 'categorias',
  initialState: {
    list: [], loading: false, error: null, successMessage: null, selected: null,
    pagination: { currentPage: 1, lastPage: 1, perPage: 50, total: 0, from: 0, to: 0 },
  },
  reducers: {
    clearError: (s) => { s.error = null; },
    clearSuccessMessage: (s) => { s.successMessage = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchCategorias.pending, (s)=>{s.loading=true;s.error=null;})
     .addCase(fetchCategorias.fulfilled, (s,a)=>{s.loading=false;s.list=a.payload.data||[];s.pagination={currentPage:a.payload.current_page,lastPage:a.payload.last_page,perPage:a.payload.per_page,total:a.payload.total,from:a.payload.from,to:a.payload.to};})
     .addCase(fetchCategorias.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(createCategoria.pending, (s)=>{s.loading=true;s.error=null;})
     .addCase(createCategoria.fulfilled, (s,a)=>{s.loading=false;s.successMessage='Categoría creada'; if(a.payload?.id){s.list.unshift(a.payload);} })
     .addCase(createCategoria.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(updateCategoria.pending, (s)=>{s.loading=true;s.error=null;})
     .addCase(updateCategoria.fulfilled, (s,a)=>{s.loading=false;s.successMessage='Categoría actualizada'; const i=s.list.findIndex(x=>String(x.id)===String(a.payload?.id)); if(i!==-1) s.list[i]=a.payload;})
     .addCase(updateCategoria.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(getCategoriaById.pending, (s)=>{s.loading=true;s.error=null;s.selected=null;})
     .addCase(getCategoriaById.fulfilled, (s,a)=>{s.loading=false;s.selected=a.payload;})
     .addCase(getCategoriaById.rejected, (s,a)=>{s.loading=false;s.error=a.payload;})
     .addCase(deleteCategoria.pending, (s)=>{s.loading=true;s.error=null;})
     .addCase(deleteCategoria.fulfilled, (s,a)=>{s.loading=false;s.successMessage='Categoría eliminada'; s.list=s.list.filter(x=>String(x.id)!==String(a.payload));})
     .addCase(deleteCategoria.rejected, (s,a)=>{s.loading=false;s.error=a.payload;});
  }
});

export const { clearError, clearSuccessMessage } = categoriasSlice.actions;
export default categoriasSlice.reducer;
