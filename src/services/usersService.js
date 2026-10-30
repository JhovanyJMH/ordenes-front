import api from './api';

const ROUTE = '/users';

const usersService = {
  getUsers: async ({ page = 1, per_page, search = '' } = {}) => {
    const params = { page, search };
    if (per_page != null) params.per_page = per_page;
    const response = await api.get(ROUTE, { params });
    return response.data;
  },

  getUserById: async (id) => {
    if (!id) throw new Error('ID requerido');
    const response = await api.get(`${ROUTE}/${id}`);
    return response.data;
  },

  createUser: async (data) => {
    const response = await api.post(ROUTE, data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`${ROUTE}/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
  filtrado: async (criterio) => {
    const response = await api.get(`${ROUTE}/filtrado`, { params: { criterio } });
    return response.data;
  },
};

export default usersService;
