import api from '../../services/api';

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

export const fetchUsersApi = async (page = 1, search = '') => {
  const response = await api.get(`/users?page=${page}&search=${search}`);
  return response.data;
};

export const createUserApi = async (userData) => {
  const response = await api.post('/users', {
    ...userData,
  });
  return response.data;
};

export const deleteUserApi = async (id) => {
  await api.delete(`/users/${id}`);
  return id;
};

export const updateUserApi = async (id, updateData) => {
  const response = await api.put(`/users/${id}`, updateData);
  return response.data;
};

export const getDataApi = async (page = 1) => {
  const response = await api.get(`/usuarios?page=${page}`);
  return response.data;
};

export const findDataApi = async (query) => {
  const response = await api.get(`/usuarios/buscar?query=${encodeURIComponent(query)}`);
  return response.data;
};
