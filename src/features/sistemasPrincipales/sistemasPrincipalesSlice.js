import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sistemasPrincipalesService from '../../services/sistemasPrincipalesService';

export const fetchSistemasPrincipales = createAsyncThunk(
  'sistemasPrincipales/fetchSistemasPrincipales',
  async ({ page = 1, search = '', per_page } = {}, { rejectWithValue }) => {
    try {
      return await sistemasPrincipalesService.getSistemasPrincipales({ page, per_page, search });
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener sistemas principales');
    }
  }
);

export const getSistemaPrincipalById = createAsyncThunk(
  'sistemasPrincipales/getSistemaPrincipalById',
  async (id, { rejectWithValue }) => {
    try {
      return await sistemasPrincipalesService.getSistemaPrincipalById(id);
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener sistema principal');
    }
  }
);

export const createSistemaPrincipal = createAsyncThunk(
  'sistemasPrincipales/createSistemaPrincipal',
  async (data, { rejectWithValue }) => {
    try {
      return await sistemasPrincipalesService.createSistemaPrincipal(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al crear sistema principal');
    }
  }
);

export const updateSistemaPrincipal = createAsyncThunk(
  'sistemasPrincipales/updateSistemaPrincipal',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await sistemasPrincipalesService.updateSistemaPrincipal(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al actualizar sistema principal');
    }
  }
);

export const deleteSistemaPrincipal = createAsyncThunk(
  'sistemasPrincipales/deleteSistemaPrincipal',
  async (id, { rejectWithValue }) => {
    try {
      await sistemasPrincipalesService.deleteSistemaPrincipal(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al eliminar sistema principal');
    }
  }
);

const sistemasPrincipalesSlice = createSlice({
  name: 'sistemasPrincipales',
  initialState: {
    list: [],
    loading: false,
    error: null,
    successMessage: null,
    selected: null,
    highlightedSistemaPrincipal: null,
    paginationInfo: null,
    pagination: { currentPage: 1, lastPage: 1, perPage: 10, total: 0, from: 0, to: 0 },
  },
  reducers: {
    clearError: (s) => { s.error = null; },
    clearSuccessMessage: (s) => { s.successMessage = null; },
    clearHighlightedSistemaPrincipal: (s) => { s.highlightedSistemaPrincipal = null; s.paginationInfo = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchSistemasPrincipales.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSistemasPrincipales.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.data || [];
        s.pagination = {
          currentPage: a.payload.current_page,
          lastPage: a.payload.last_page,
          perPage: a.payload.per_page,
          total: a.payload.total,
          from: a.payload.from,
          to: a.payload.to,
        };
      })
      .addCase(fetchSistemasPrincipales.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createSistemaPrincipal.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createSistemaPrincipal.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Sistema principal creado';
        if (a.payload?.sistema_principal) {
          s.highlightedSistemaPrincipal = a.payload.sistema_principal.id;
          s.paginationInfo = a.payload.pagination_info;
        }
        if (a.payload?.id) s.list.unshift(a.payload);
      })
      .addCase(createSistemaPrincipal.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateSistemaPrincipal.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateSistemaPrincipal.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Sistema principal actualizado';
        if (a.payload?.sistema_principal) {
          s.highlightedSistemaPrincipal = a.payload.sistema_principal.id;
          s.paginationInfo = a.payload.pagination_info;
        }
        const i = s.list.findIndex((x) => String(x.id) === String(a.payload?.id));
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(updateSistemaPrincipal.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(getSistemaPrincipalById.pending, (s) => { s.loading = true; s.error = null; s.selected = null; })
      .addCase(getSistemaPrincipalById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; })
      .addCase(getSistemaPrincipalById.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(deleteSistemaPrincipal.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteSistemaPrincipal.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Sistema principal eliminado';
        s.list = s.list.filter((x) => String(x.id) !== String(a.payload));
      })
      .addCase(deleteSistemaPrincipal.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearError, clearSuccessMessage, clearHighlightedSistemaPrincipal } = sistemasPrincipalesSlice.actions;
export default sistemasPrincipalesSlice.reducer;
