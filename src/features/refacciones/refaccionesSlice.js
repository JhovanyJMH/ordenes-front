import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import refaccionesService from '../../services/refaccionesService';

export const fetchRefacciones = createAsyncThunk(
  'refacciones/fetchRefacciones',
  async ({ page = 1, per_page = 50, search = '' } = {}, { rejectWithValue }) => {
    try {
      return await refaccionesService.getRefacciones({ page, per_page, search });
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener refacciones');
    }
  }
);

export const getRefaccionById = createAsyncThunk(
  'refacciones/getRefaccionById',
  async (id, { rejectWithValue }) => {
    try {
      return await refaccionesService.getRefaccionById(id);
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener refacción');
    }
  }
);

export const createRefaccion = createAsyncThunk(
  'refacciones/createRefaccion',
  async (data, { rejectWithValue }) => {
    try {
      return await refaccionesService.createRefaccion(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al crear refacción');
    }
  }
);

export const updateRefaccion = createAsyncThunk(
  'refacciones/updateRefaccion',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await refaccionesService.updateRefaccion(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al actualizar refacción');
    }
  }
);

export const deleteRefaccion = createAsyncThunk(
  'refacciones/deleteRefaccion',
  async (id, { rejectWithValue }) => {
    try {
      await refaccionesService.deleteRefaccion(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al eliminar refacción');
    }
  }
);

const refaccionesSlice = createSlice({
  name: 'refacciones',
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
    b.addCase(fetchRefacciones.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchRefacciones.fulfilled, (s, a) => {
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
      .addCase(fetchRefacciones.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createRefaccion.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createRefaccion.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Refacción creada';
        if (a.payload?.id) s.list.unshift(a.payload);
      })
      .addCase(createRefaccion.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateRefaccion.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateRefaccion.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Refacción actualizada';
        const i = s.list.findIndex((x) => String(x.id) === String(a.payload?.id));
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(updateRefaccion.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(getRefaccionById.pending, (s) => { s.loading = true; s.error = null; s.selected = null; })
      .addCase(getRefaccionById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; })
      .addCase(getRefaccionById.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(deleteRefaccion.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteRefaccion.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Refacción eliminada';
        s.list = s.list.filter((x) => String(x.id) !== String(a.payload));
      })
      .addCase(deleteRefaccion.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearError, clearSuccessMessage } = refaccionesSlice.actions;
export default refaccionesSlice.reducer;
