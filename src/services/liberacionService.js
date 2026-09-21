import api from './api';

const ROUTE = '/solicitud-liberacion';

const extractErrorMessage = (err) => {
  const data = err.response?.data;
  if (data?.errors) {
    return Object.values(data.errors).flat().join('\n');
  }
  return data?.message || err?.message || 'Error en la solicitud';
};

const liberacionService = {
  getLiberaciones: async () => {
    const response = await api.get(ROUTE);
    return response.data;
  },
  getLiberacionById: async (id) => {
    const response = await api.get(`${ROUTE}/${id}`);
    return response.data;
  },
  createLiberacion: async (data) => {
    const response = await api.post(ROUTE, data);
    return response.data;
  },
  updateLiberacion: async (id, data) => {
    const response = await api.put(`${ROUTE}/${id}`, data);
    return response.data;
  },
  deleteLiberacion: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
};

export { extractErrorMessage };
export default liberacionService;
