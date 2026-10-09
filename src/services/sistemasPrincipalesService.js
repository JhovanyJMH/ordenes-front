import api from './api';

const ROUTE = '/sistema-principal';

const sistemasPrincipalesService = {
  getSistemasPrincipales: async ({ page = 1, per_page = 50, search = '' } = {}) => {
    const response = await api.get(ROUTE, { params: { page, per_page, search } });
    return response.data;
  },
  getSistemaPrincipalById: async (id) => {
    const response = await api.get(`${ROUTE}/${id}`);
    return response.data;
  },
  createSistemaPrincipal: async (data) => {
    const response = await api.post(ROUTE, data);
    return response.data;
  },
  updateSistemaPrincipal: async (id, data) => {
    const response = await api.put(`${ROUTE}/${id}`, data);
    return response.data;
  },
  deleteSistemaPrincipal: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
};

export default sistemasPrincipalesService;
