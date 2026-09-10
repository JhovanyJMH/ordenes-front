import api from './api';

const ROUTE = '/equipos';

const equiposService = {
  getEquipos: async ({ page = 1, per_page = 50, search = '' } = {}) => {
    const response = await api.get(ROUTE, { params: { page, per_page, search } });
    return response.data;
  },
  getEquipoById: async (id) => {
    const response = await api.get(`${ROUTE}/${id}`);
    return response.data;
  },
  createEquipo: async (data) => {
    const response = await api.post(ROUTE, data);
    return response.data;
  },
  updateEquipo: async (id, data) => {
    const response = await api.put(`${ROUTE}/${id}`, data);
    return response.data;
  },
  deleteEquipo: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
  filtrado: async (criterio) => {
    const response = await api.get(`${ROUTE}/filtrado`, { params: { criterio } });
    return response.data;
  },
};

export default equiposService;
