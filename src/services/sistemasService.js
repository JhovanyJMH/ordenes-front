import api from './api';

const ROUTE = '/sistemas';

const sistemasService = {
  getSistemas: async ({ page = 1, per_page, search = '', sistema_principal_id } = {}) => {
    const params = { page, search, sistema_principal_id };
    if (per_page != null) params.per_page = per_page;
    const response = await api.get(ROUTE, { params });
    return response.data;
  },
  filtrado: async (search) => {
    const response = await api.get(`${ROUTE}/filtrado`, { params: { search } });
    return { status: 'success', sistemas: response.data };
  },
  getReporte: async () => {
    const response = await api.get(`${ROUTE}/reporte`);
    return response.data;
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