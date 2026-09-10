import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adscripcionesService from '../../services/adscripcionesService';

export const fetchAdscripciones = createAsyncThunk(
  'adscripciones/fetchAdscripciones',
  async ({ page = 1, per_page = 50, search = '' } = {}, { rejectWithValue }) => {
    try {
      return await adscripcionesService.getAdscripciones({ page, per_page, search });
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener adscripciones');
    }
  }
);

export const getAdscripcionById = createAsyncThunk(
  'adscripciones/getAdscripcionById',
  async (id, { rejectWithValue }) => {
    try {
      return await adscripcionesService.getAdscripcionById(id);
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener adscripción');
    }
  }
);

export const createAdscripcion = createAsyncThunk(
  'adscripciones/createAdscripcion',
  async (data, { rejectWithValue }) => {
    try {
      return await adscripcionesService.createAdscripcion(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al crear adscripción');
    }
  }
);

export const updateAdscripcion = createAsyncThunk(
  'adscripciones/updateAdscripcion',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await adscripcionesService.updateAdscripcion(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al actualizar adscripción');
    }
  }
);

export const deleteAdscripcion = createAsyncThunk(
  'adscripciones/deleteAdscripcion',
  async (id, { rejectWithValue }) => {
    try {
      await adscripcionesService.deleteAdscripcion(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al eliminar adscripción');
    }
  }
);

const adscripcionesSlice = createSlice({
  name: 'adscripciones',
  initialState: {
    list: [],
    loading: false,
    error: null,
    successMessage: null,
    selected: null,
    pagination: { currentPage: 1, lastPage: 1, perPage: 50, total: 0, from: 0, to: 0 },
  },
  reducers: {
    clearError: (s) => { s.error = null; },
    clearSuccessMessage: (s) => { s.successMessage = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchAdscripciones.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAdscripciones.fulfilled, (s, a) => {
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
      .addCase(fetchAdscripciones.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createAdscripcion.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createAdscripcion.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Adscripción creada';
        if (a.payload?.id) s.list.unshift(a.payload);
      })
      .addCase(createAdscripcion.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateAdscripcion.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateAdscripcion.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Adscripción actualizada';
        const i = s.list.findIndex((x) => String(x.id) === String(a.payload?.id));
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(updateAdscripcion.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(getAdscripcionById.pending, (s) => { s.loading = true; s.error = null; s.selected = null; })
      .addCase(getAdscripcionById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; })
      .addCase(getAdscripcionById.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(deleteAdscripcion.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteAdscripcion.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Adscripción eliminada';
        s.list = s.list.filter((x) => String(x.id) !== String(a.payload));
      })
      .addCase(deleteAdscripcion.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearError, clearSuccessMessage } = adscripcionesSlice.actions;
export default adscripcionesSlice.reducer;
