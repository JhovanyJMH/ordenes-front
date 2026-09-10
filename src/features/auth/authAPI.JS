import api from '../../services/api';

// Función helper para detectar errores de conectividad
const isNetworkError = (error) => {
  return (
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error' ||
    error.code === 'ERR_CONNECTION_TIMED_OUT' ||
    error.code === 'ECONNABORTED' ||
    error.message?.includes('timeout') ||
    error.message?.includes('network')
  );
};

export const loginApi = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (error) {
    // Extraer datos de error del backend si están disponibles
    const errorData = error.response?.data;
    if (errorData) {
      throw errorData; // { message: 'Credenciales inválidas' }
    }
    throw error;
  }
};

export const getMeApi = async () => {
  try {
    // Usar el endpoint /user que requiere auth:sanctumme
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    // Manejar errores de red específicamente
    if (isNetworkError(error)) {
      console.warn('Error de conectividad detectado. Manteniendo sesión local.');
      // Retornar null en lugar de lanzar error para mantener la sesión
      return null;
    }
    throw error.response?.data || error;
  }
};

export const checkUserStatusApi = async () => {
  try {
    // Usar el endpoint /user que requiere auth:sanctum
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    // Manejar errores de red específicamente
    if (isNetworkError(error)) {
      console.warn('Error de conectividad detectado. Manteniendo sesión local.');
      // Retornar null en lugar de lanzar error para mantener la sesión
      return null;
    }
    throw error.response?.data || error;
  }
}; 