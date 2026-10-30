import api from './api';

const ROUTE = '/sistema-principal';

const sistemasPrincipalesService = {
  getSistemasPrincipales: async ({ page = 1, per_page, search = '' } = {}) => {
    const params = { page, search };
    if (per_page != null) params.per_page = per_page;
    const response = await api.get(ROUTE, { params });
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
