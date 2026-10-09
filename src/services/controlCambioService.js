import api from './api';

const ROUTE = '/control-cambios';

const getDocumentoFilename = (numeroControl) => {
  const safeNumeroControl = String(numeroControl || 'control-cambios')
    .replace(/[^A-Za-z0-9._ -]/g, '-')
    .trim();
  return `${safeNumeroControl}-ADJUNTO.pdf`;
};

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
    const response = await api.post(ROUTE, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },
  update: async (id, data) => {
    let response;
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      response = await api.post(`${ROUTE}/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      response = await api.put(`${ROUTE}/${id}`, data);
    }
    return response.data;
  },
  downloadDocumento: async (id) => {
    const response = await api.get(`${ROUTE}/${id}/documento`, { responseType: 'blob' });
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
};

export default controlCambioService;
export { getDocumentoFilename };
