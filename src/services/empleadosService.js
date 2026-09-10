import api from './api';

const ROUTE = '/empleados';

const empleadosService = {
  getEmpleados: async ({ page = 1, per_page = 50, search = '' } = {}) => {
    const response = await api.get(ROUTE, {
      params: { page, per_page, search },
    });
    // Backend returns Laravel paginator shape per provided controller
    return response.data;
  },

  getEmpleadoById: async (id) => {
    if (!id) throw new Error('ID requerido');
    const response = await api.get(`${ROUTE}/${id}`);
    return response.data;
  },

  createEmpleado: async (data) => {
    const response = await api.post(ROUTE, data);
    return response.data;
  },

  updateEmpleado: async (id, data) => {
    const response = await api.put(`${ROUTE}/${id}`, data);
    return response.data;
  },

  deleteEmpleado: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
  filtrado: async (criterio) => {
    const response = await api.get(`${ROUTE}/filtrado`, { params: { criterio } });
    return response.data;
  },
};

export default empleadosService;
