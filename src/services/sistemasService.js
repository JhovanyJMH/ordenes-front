import api from './api';

const ROUTE = '/sistemas';

const sistemasService = {
  getSistemas: async ({ page = 1, per_page = 15, search = '', sistema_principal_id } = {}) => {
    const response = await api.get(ROUTE, {
      params: { page, per_page, search, sistema_principal_id },
    });
    return response.data;
  },
  filtrado: async (search) => {
    const response = await api.get(`${ROUTE}/filtrado`, { params: { search } });
    return { status: 'success', sistemas: response.data };
  },
  getSistemaById: async (id) => {
    const response = await api.get(`${ROUTE}/${id}`);
    return response.data;
  },
  createSistema: async (data) => {
    const response = await api.post(ROUTE, data);
    return response.data;
  },
  updateSistema: async (id, data) => {
    const response = await api.put(`${ROUTE}/${id}`, data);
    return response.data;
  },
  deleteSistema: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
};

export default sistemasService;