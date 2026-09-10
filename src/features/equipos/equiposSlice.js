import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equiposService from '../../services/equiposService';

export const fetchEquipos = createAsyncThunk(
  'equipos/fetchEquipos',
  async ({ page = 1, per_page = 50, search = '' } = {}, { rejectWithValue }) => {
    try {
      return await equiposService.getEquipos({ page, per_page, search });
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener equipos');
    }
  }
);

export const getEquipoById = createAsyncThunk(
  'equipos/getEquipoById',
  async (id, { rejectWithValue }) => {
    try {
      return await equiposService.getEquipoById(id);
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener equipo');
    }
  }
);

export const createEquipo = createAsyncThunk(
  'equipos/createEquipo',
  async (data, { rejectWithValue }) => {
    try {
      return await equiposService.createEquipo(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al crear equipo');
    }
  }
);

export const updateEquipo = createAsyncThunk(
  'equipos/updateEquipo',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await equiposService.updateEquipo(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al actualizar equipo');
    }
  }
);

export const deleteEquipo = createAsyncThunk(
  'equipos/deleteEquipo',
  async (id, { rejectWithValue }) => {
    try {
      await equiposService.deleteEquipo(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err?.message || 'Error al eliminar equipo');
    }
  }
);

const equiposSlice = createSlice({
  name: 'equipos',
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
    b.addCase(fetchEquipos.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchEquipos.fulfilled, (s, a) => {
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
      .addCase(fetchEquipos.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createEquipo.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createEquipo.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Equipo creado';
        if (a.payload?.id) s.list.unshift(a.payload);
      })
      .addCase(createEquipo.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateEquipo.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateEquipo.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Equipo actualizado';
        const i = s.list.findIndex((x) => String(x.id) === String(a.payload?.id));
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(updateEquipo.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(getEquipoById.pending, (s) => { s.loading = true; s.error = null; s.selected = null; })
      .addCase(getEquipoById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; })
      .addCase(getEquipoById.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(deleteEquipo.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteEquipo.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = 'Equipo eliminado';
        s.list = s.list.filter((x) => String(x.id) !== String(a.payload));
      })
      .addCase(deleteEquipo.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearError, clearSuccessMessage } = equiposSlice.actions;
export default equiposSlice.reducer;
