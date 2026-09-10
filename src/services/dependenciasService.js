import api from './api';

// Rutas específicas para el módulo de dependencias
const ROUTES = {
  SECRETARIAS: '/catalogo/dependencias/secretarias',
  DIRECCIONES: '/catalogo/dependencias/direcciones',
  OFICINAS: '/catalogo/dependencias/oficinas',
  DEPENDENCIA: '/catalogo/dependencias'
};

export const dependenciasService = {
  // Catálogos auxiliares
  getSecretarias: async () => {
    try {
      const response = await api.get(ROUTES.SECRETARIAS);
      if (response.data?.JsonResponse?.data?.secretarias) {
        return response.data.JsonResponse.data.secretarias;
      }
      console.error('Estructura de respuesta inválida para secretarías:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener secretarías:', error);
      return [];
    }
  },

  getDirecciones: async (secretariaId) => {
    try {
      if (!secretariaId) {
        console.error('secretaria_id es requerido para obtener direcciones');
        return [];
      }
      
      const response = await api.post(ROUTES.DIRECCIONES, {
        secretaria_id: secretariaId
      });
      
      if (response.data?.JsonResponse?.data?.direcciones) {
        return response.data.JsonResponse.data.direcciones;
      }
      console.error('Estructura de respuesta inválida para direcciones:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      return [];
    }
  },

  getOficinas: async (direccionId, secretariaId) => {
    try {
      if (!direccionId || !secretariaId) {
        console.error('direccion_id y secretaria_id son requeridos para obtener oficinas');
        return [];
      }

      const response = await api.post(ROUTES.OFICINAS, {
        direccion_id: direccionId,
        secretaria_id: secretariaId
      });
      
      if (response.data?.JsonResponse?.data?.oficinas) {
        return response.data.JsonResponse.data.oficinas;
      }
      console.error('Estructura de respuesta inválida para oficinas:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener oficinas:', error);
      return [];
    }
  },

  // CRUD de dependencias (tabla cat_dependencias)
  getDependencias: async (page = 1, search = '') => {
    try {
      const response = await api.get(`${ROUTES.DEPENDENCIA}/todo`, {
        params: {
          page,
          search,
        },
      });
      const respData = response.data;

      // Si el backend retorna un array simple (nuevo back), envolver en estructura de paginación esperada
      if (Array.isArray(respData)) {
        const dataArray = respData;
        const total = dataArray.length;
        return {
          data: dataArray,
          current_page: 1,
          last_page: 1,
          per_page: total,
          total: total,
          from: total ? 1 : 0,
          to: total ? total : 0,
        };
      }

      // Si el backend devuelve la estructura personalizada dentro de JsonResponse
      if (respData?.JsonResponse?.data?.dependencias) {
        const dataArray = respData.JsonResponse.data.dependencias;
        const total = Array.isArray(dataArray) ? dataArray.length : 0;
        return {
          data: dataArray,
          current_page: 1,
          last_page: 1,
          per_page: total,
          total: total,
          from: total ? 1 : 0,
          to: total ? total : 0,
        };
      }

      // Si ya es una respuesta paginada (data + current_page ...), retornarla tal cual
      return respData;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDependenciaById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID es requerido para obtener la dependencia');
      }
      const response = await api.get(`${ROUTES.DEPENDENCIA}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener dependencia por ID:', error);
      throw error;
    }
  },

  createDependencia: async (payload) => {
    try {
      const response = await api.post(ROUTES.DEPENDENCIA, payload);
      return response.data;
    } catch (error) {
      console.error('Error al crear dependencia:', error);
      throw error;
    }
  },

  updateDependencia: async (id, payload) => {
    try {
      const response = await api.put(`${ROUTES.DEPENDENCIA}/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar dependencia:', error);
      throw error;
    }
  }
  ,
  deleteDependencia: async (id) => {
    try {
      if (!id) {
        throw new Error('ID es requerido para eliminar la dependencia');
      }
      const response = await api.delete(`${ROUTES.DEPENDENCIA}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar dependencia:', error);
      throw error;
    }
  }
};

export default dependenciasService;