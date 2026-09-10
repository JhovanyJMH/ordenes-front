import api from './api';

const ROUTE = '/solicitudes';

const extractErrorMessage = (err) => {
  const data = err.response?.data;
  if (data?.errors) {
    return Object.values(data.errors).flat().join('\n');
  }
  return data?.message || err?.message || 'Error en la solicitud';
};

const solicitudesService = {
  getSolicitudes: async ({ page = 1, per_page = 50, search = '' } = {}) => {
    const response = await api.get(ROUTE, { params: { page, per_page, search } });
    return response.data;
  },
  getSolicitudById: async (id) => {
    const response = await api.get(`${ROUTE}/${id}`);
    return response.data;
  },
  createSolicitud: async (data) => {
    const response = await api.post(ROUTE, data);
    return response.data;
  },
  updateSolicitud: async (id, data) => {
    const response = await api.put(`${ROUTE}/${id}`, data);
    return response.data;
  },
  deleteSolicitud: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
  getEstadisticas: async () => {
    const response = await api.get(`${ROUTE}/estadisticas`);
    return response.data;
  },
  getSolicitudesTabla: async ({ page = 1, per_page = 15, search = '' } = {}) => {
    const response = await api.get(`${ROUTE}/tabla`, { params: { page, per_page, search } });
    return response.data;
  },
  getSolicitudesGeneral: async ({ page = 1, per_page = 25, search = '' } = {}) => {
    const response = await api.get(`${ROUTE}/general`, { params: { page, per_page, search } });
    return response.data;
  },
};

export { extractErrorMessage };
export default solicitudesService;
