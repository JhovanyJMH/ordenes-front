import api from './api';

const informesService = {
  resumenSolicitud: async (fecini, fecfin) => {
    const response = await api.get(`/informes/resumen-solicitud/${fecini}/${fecfin}`);
    return response.data;
  },
  resumenAdscripcion: async (fecini, fecfin) => {
    const response = await api.get(`/informes/resumen-adscripcion/${fecini}/${fecfin}`);
    return response.data;
  },
  resumenSustantiva: async (fecini, fecfin) => {
    const response = await api.get(`/informes/resumen-sustantiva/${fecini}/${fecfin}`);
    return response.data;
  },
  serviciosAnual: async () => {
    const response = await api.get('/informes/servicios-anual');
    return response.data;
  },
};

export default informesService;
