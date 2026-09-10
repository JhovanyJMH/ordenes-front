import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchUsersApi,
  createUserApi,
  deleteUserApi,
  updateUserApi,
  getDataApi,
  findDataApi
} from './usersAPI';

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// Obtener usuarios con paginación
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page = 1, search = '' }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await fetchUsersApi(page, search, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al obtener usuarios');
    }
  }
);

// Crear un usuario
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { getState, rejectWithValue }) => {
    try {
      if (!userData.name || !userData.email || !userData.password || !userData.profile || !userData.dependencia_id) {
        return rejectWithValue('Todos los campos son obligatorios, incluyendo la dependencia');
      }

      const token = getState().auth.token;
      return await createUserApi(userData, token);
    } catch (err) {
      console.error('Error en createUser:', err.response?.data || err);
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         'Error al crear usuario';
      return rejectWithValue(errorMessage);
    }
  }
);

// Eliminar un usuario
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await deleteUserApi(id, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al eliminar usuario');
    }
  }
);

// Editar usuario
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { getState, rejectWithValue }) => {
    try {
      if (!userData.dependencia_id) {
        return rejectWithValue('La dependencia es obligatoria');
      }

      const token = getState().auth.token;
      return await updateUserApi(id, userData, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al actualizar usuario');
    }
  }
);

// Obtener todos los usuarios (getData)
export const getData = createAsyncThunk(
  'users/getData',
  async (page = 1, { rejectWithValue }) => {
    try {
      return await getDataApi(page);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener usuarios');
    }
  }
);

// Buscar usuarios (findData)
export const findData = createAsyncThunk(
  'users/findData',
  async (query, { rejectWithValue }) => {
    try {
      return await findDataApi(query);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al buscar usuarios');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    error: null,
    successMessage: null,
    pagination: {
      currentPage: 1,
      lastPage: 1,
      perPage: 10,
      total: 0,
      from: 0,
      to: 0
    },
    highlightedUser: null,
    paginationInfo: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearHighlightedUser: (state) => {
      
      state.highlightedUser = null;
      state.paginationInfo = null;
      
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
          from: action.payload.from,
          to: action.payload.to
        };
        // Preservar highlightedUser y paginationInfo cuando se recargan los datos
        // Solo se limpiarán cuando se llame explícitamente a clearHighlightedUser
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.pagination_info) {
          state.paginationInfo = action.payload.pagination_info;
          state.highlightedUser = action.payload.user.id;
        }
        state.successMessage = 'Usuario creado exitosamente';
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(user => user.id !== action.payload);
        state.successMessage = 'Usuario eliminado exitosamente';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.pagination_info) {
          state.paginationInfo = action.payload.pagination_info;
          state.highlightedUser = action.payload.user.id;
        }
        state.successMessage = 'Usuario actualizado exitosamente';
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearHighlightedUser } = usersSlice.actions;
export default usersSlice.reducer;

