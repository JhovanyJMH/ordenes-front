import api from './api';

const ROUTE = '/solicitud-liberacion';

const getDocumentoFilename = (numeroControl, version) => {
  const safeNumeroControl = String(numeroControl || 'liberacion')
    .replace(/[^A-Za-z0-9._ -]/g, '-')
    .trim();
  const safeVersion = String(version || '')
    .trim()
    .replace(/^V\s*/i, '')
    .replace(/[^A-Za-z0-9._ -]/g, '-');
  const controlWithVersion = safeVersion
    ? safeNumeroControl.replace(/-(\d+)$/, ` V${safeVersion}-$1`)
    : safeNumeroControl;

  return `${controlWithVersion}-ADJUNTO.pdf`;
};

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
    const response = await api.post(ROUTE, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateLiberacion: async (id, data) => {
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
  deleteLiberacion: async (id) => {
    const response = await api.delete(`${ROUTE}/${id}`);
    return response.data;
  },
};

export { extractErrorMessage };
export { getDocumentoFilename };
export default liberacionService;
