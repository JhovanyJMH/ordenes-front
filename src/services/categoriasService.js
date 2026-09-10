import api from './api';

const ROUTE = '/categorias';

const categoriasService = {
  getCategorias: async ({ page = 1, per_page = 50, search = '' } = {}) => {
    const response = await api.get(ROUTE, { params: { page, per_page, search } });
    return response.data;
  },
  getCategoriaById: async (id) => {
    const response = await api.get(`${ROUTE}/${id}`);
    return response.data;
  },
  createCategoria: async (data) => {
    const response = await api.post(ROUTE, data);
    return response.data;
  },
  updateCategoria: async (id, data) => {
    const response = await api.put(`${ROUTE}/${id}`, data);
    return response.data;
  },
  deleteCategoria: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
  getServiciosByCategoria: async (categoriaId, { page = 1, per_page = 50, search = '' } = {}) => {
    const response = await api.get(`${ROUTE}/${categoriaId}/servicios`, { params: { page, per_page, search } });
    return response.data;
  }
};

export default categoriasService;
