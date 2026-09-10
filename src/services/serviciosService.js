import api from './api';

const ROUTE = '/servicios';

const serviciosService = {
  getServicios: async ({ page = 1, per_page = 50, search = '', categoria_id = null } = {}) => {
    const params = { page, per_page, search };
    if (categoria_id !== null && categoria_id !== undefined) params.categoria_id = categoria_id;
    const response = await api.get(ROUTE, { params });
    return response.data;
  },
  getServicioById: async (id) => {
    const response = await api.get(`${ROUTE}/${id}`);
    return response.data;
  },
  createServicio: async (data) => {
    const response = await api.post(ROUTE, data);
    return response.data;
  },
  updateServicio: async (id, data) => {
    const response = await api.put(`${ROUTE}/${id}`, data);
    return response.data;
  },
  deleteServicio: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
  filtrado: async (criterio) => {
    const response = await api.get(`${ROUTE}/filtrado`, { params: { criterio } });
    return response.data;
  },
};

export default serviciosService;
