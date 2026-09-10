import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dependenciasService from '../../services/dependenciasService';

// Thunks
export const fetchDependencias = createAsyncThunk(
  'dependencias/fetchDependencias',
  async ({ page = 1, search = '' } = {}, { rejectWithValue }) => {
    try {
      const response = await dependenciasService.getDependencias(page, search);
      return response;
    } catch (err) {
      return rejectWithValue(err?.message || 'Error al obtener dependencias');
    }
  }
);

export const createDependencia = createAsyncThunk(
  'dependencias/createDependencia',
  async (data, { rejectWithValue }) => {
    try {
      const response = await dependenciasService.createDependencia(data);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.JsonResponse?.message || 'Error al crear dependencia');
    }
  }
);

export const updateDependencia = createAsyncThunk(
  'dependencias/updateDependencia',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await dependenciasService.updateDependencia(id, data);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.JsonResponse?.message || 'Error al actualizar dependencia');
    }
  }
);

export const getDependenciaById = createAsyncThunk(
  'dependencias/getDependenciaById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await dependenciasService.getDependenciaById(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.JsonResponse?.message || 'Error al obtener dependencia');
    }
  }
);

export const deleteDependencia = createAsyncThunk(
  'dependencias/deleteDependencia',
  async (id, { rejectWithValue }) => {
    try {
      const response = await dependenciasService.deleteDependencia(id);
      return { id, response };
    } catch (err) {
      return rejectWithValue(err.response?.data?.JsonResponse?.message || 'Error al eliminar dependencia');
    }
  }
);

const dependenciasSlice = createSlice({
  name: 'dependencias',
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
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDependencias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDependencias.fulfilled, (state, action) => {
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
      .addCase(fetchDependencias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDependencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDependencia.fulfilled, (state, action) => {
        state.loading = false;
        const dependencia = action.payload?.JsonResponse?.data?.dependencia || null;
        if (dependencia) {
          state.list.push(dependencia);
        }
        state.successMessage = action.payload?.JsonResponse?.message || 'Dependencia creada correctamente';
      })
      .addCase(createDependencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDependencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDependencia.fulfilled, (state, action) => {
        state.loading = false;
        const dependencia = action.payload?.JsonResponse?.data?.dependencia || null;
        if (dependencia) {
          const index = state.list.findIndex((d) => d.id === dependencia.id);
          if (index !== -1) {
            state.list[index] = dependencia;
          }
        }
        state.successMessage = action.payload?.JsonResponse?.message || 'Dependencia actualizada correctamente';
      })
      .addCase(updateDependencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDependenciaById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selected = null;
      })
      .addCase(getDependenciaById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload?.JsonResponse?.data?.dependencia || action.payload;
      })
      .addCase(getDependenciaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selected = null;
      });
      builder
      .addCase(deleteDependencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDependencia.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload?.id;
        if (id) {
          state.list = state.list.filter((d) => String(d.id) !== String(id));
        }
        state.successMessage = action.payload?.response?.JsonResponse?.message || 'Dependencia eliminada correctamente';
      })
      .addCase(deleteDependencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage } = dependenciasSlice.actions;
export default dependenciasSlice.reducer;
