import api from './api';

const ROUTE = '/adscripciones';

const adscripcionesService = {
  getAdscripciones: async ({ page = 1, per_page, search = '' } = {}) => {
    const params = { page, search };
    if (per_page != null) params.per_page = per_page;
    const response = await api.get(ROUTE, { params });
    return response.data;
  },
  getAdscripcionById: async (id) => {
    const response = await api.get(`${ROUTE}/${id}`);
    return response.data;
  },
  createAdscripcion: async (data) => {
    const response = await api.post(ROUTE, data);
    return response.data;
  },
  updateAdscripcion: async (id, data) => {
    const response = await api.put(`${ROUTE}/${id}`, data);
    return response.data;
  },
  deleteAdscripcion: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
  filtrado: async (criterio) => {
    const response = await api.get(`${ROUTE}/filtrado`, { params: { criterio } });
    return response.data;
  },
};

export default adscripcionesService;
