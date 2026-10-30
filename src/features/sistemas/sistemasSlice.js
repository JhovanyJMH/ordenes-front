import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sistemasService from '../../services/sistemasService';

export const fetchSistemas = createAsyncThunk(
  'sistemas/fetchSistemas',
  async ({ page = 1, search = '', sistema_principal_id = null, per_page } = {}, { rejectWithValue }) => {
    try {
      return await sistemasService.getSistemas({ page, per_page, search, sistema_principal_id });
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener sistemas');
    }
  }
);

export const getSistemaById = createAsyncThunk(
  'sistemas/getSistemaById',
  async (id, { rejectWithValue }) => {
    try {
      return await sistemasService.getSistemaById(id);
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener sistema');
    }
  }
);

export const createSistema = createAsyncThunk(
  'sistemas/createSistema',
  async (data, { rejectWithValue }) => {
    try {
      return await sistemasService.createSistema(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al crear sistema');
    }
  }
);

export const updateSistema = createAsyncThunk(
  'sistemas/updateSistema',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await sistemasService.updateSistema(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al actualizar sistema');
    }
  }
);

export const deleteSistema = createAsyncThunk(
  'sistemas/deleteSistema',
  async (id, { rejectWithValue }) => {
    try {
      await sistemasService.deleteSistema(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al eliminar sistema');
    }
  }
);

const sistemasSlice = createSlice({
  name: 'sistemas',
  initialState: {
    list: [],
    loading: false,
    error: null,
    successMessage: null,
    selected: null,
    highlightedSistema: null,
    paginationInfo: null,
    pagination: { currentPage: 1, lastPage: 1, perPage: 10, total: 0, from: 0, to: 0 },
  },
  reducers: {
    clearError: (s) => { s.error = null; },
    clearSuccessMessage: (s) => { s.successMessage = null; },
    clearHighlightedSistema: (s) => { s.highlightedSistema = null; s.paginationInfo = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchSistemas.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSistemas.fulfilled, (s, a) => {
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
      .addCase(fetchSistemas.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createSistema.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createSistema.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Sistema creado';
        if (a.payload?.sistema) {
          s.highlightedSistema = a.payload.sistema.id;
          s.paginationInfo = a.payload.pagination_info;
        }
        if (a.payload?.id) s.list.unshift(a.payload);
      })
      .addCase(createSistema.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateSistema.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateSistema.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Sistema actualizado';
        if (a.payload?.sistema) {
          s.highlightedSistema = a.payload.sistema.id;
          s.paginationInfo = a.payload.pagination_info;
        }
        const i = s.list.findIndex((x) => String(x.id) === String(a.payload?.id));
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(updateSistema.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(getSistemaById.pending, (s) => { s.loading = true; s.error = null; s.selected = null; })
      .addCase(getSistemaById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; })
      .addCase(getSistemaById.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(deleteSistema.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteSistema.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Sistema eliminado';
        s.list = s.list.filter((x) => String(x.id) !== String(a.payload));
      })
      .addCase(deleteSistema.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearError, clearSuccessMessage, clearHighlightedSistema } = sistemasSlice.actions;
export default sistemasSlice.reducer;
