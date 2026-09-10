import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import empleadosService from '../../services/empleadosService';

export const fetchEmpleados = createAsyncThunk(
  'empleados/fetchEmpleados',
  async ({ page = 1, per_page = 50, search = '' } = {}, { rejectWithValue }) => {
    try {
      const resp = await empleadosService.getEmpleados({ page, per_page, search });
      return resp;
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener empleados');
    }
  }
);

export const getEmpleadoById = createAsyncThunk(
  'empleados/getEmpleadoById',
  async (id, { rejectWithValue }) => {
    try {
      return await empleadosService.getEmpleadoById(id);
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener empleado');
    }
  }
);

export const createEmpleado = createAsyncThunk(
  'empleados/createEmpleado',
  async (data, { rejectWithValue }) => {
    try {
      return await empleadosService.createEmpleado(data);
    } catch (err) {
      const msg = err.response?.data?.message || err?.message || 'Error al crear empleado';
      return rejectWithValue(msg);
    }
  }
);

export const updateEmpleado = createAsyncThunk(
  'empleados/updateEmpleado',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await empleadosService.updateEmpleado(id, data);
    } catch (err) {
      const msg = err.response?.data?.message || err?.message || 'Error al actualizar empleado';
      return rejectWithValue(msg);
    }
  }
);

export const deleteEmpleado = createAsyncThunk(
  'empleados/deleteEmpleado',
  async (id, { rejectWithValue }) => {
    try {
      await empleadosService.deleteEmpleado(id);
      return id;
    } catch (err) {
      const msg = err.response?.data?.message || err?.message || 'Error al eliminar empleado';
      return rejectWithValue(msg);
    }
  }
);

const empleadosSlice = createSlice({
  name: 'empleados',
  initialState: {
    list: [],
    loading: false,
    error: null,
    successMessage: null,
    selected: null,
    pagination: {
      currentPage: 1,
      lastPage: 1,
      perPage: 50,
      total: 0,
      from: 0,
      to: 0,
    },
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccessMessage: (state) => { state.successMessage = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmpleados.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmpleados.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
        state.pagination = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
          from: action.payload.from,
          to: action.payload.to,
        };
      })
      .addCase(fetchEmpleados.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createEmpleado.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmpleado.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Empleado creado exitosamente';
        // Optionally push to list if backend returns object
        if (action.payload?.id) {
          state.list.unshift(action.payload);
        }
      })
      .addCase(createEmpleado.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateEmpleado.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmpleado.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Empleado actualizado exitosamente';
        const idx = state.list.findIndex((e) => String(e.id) === String(action.payload?.id));
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateEmpleado.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getEmpleadoById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selected = null;
      })
      .addCase(getEmpleadoById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(getEmpleadoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteEmpleado.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmpleado.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((e) => String(e.id) !== String(action.payload));
        state.successMessage = 'Empleado eliminado exitosamente';
      })
      .addCase(deleteEmpleado.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage } = empleadosSlice.actions;
export default empleadosSlice.reducer;
