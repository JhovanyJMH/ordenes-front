import api from './api';

const ROUTE = '/control-cambios';

const controlCambioService = {
  getAll: async () => {
    const response = await api.get(ROUTE);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`${ROUTE}/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post(ROUTE, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`${ROUTE}/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
};

export default controlCambioService;
