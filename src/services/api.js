import axios from 'axios';

// Definir la URL base

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  // withCredentials: false es el valor por defecto
  // No es necesario para Sanctum con Bearer tokens
});

// Interceptor para agregar el token Bearer a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Token de Sanctum se envía como Bearer token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Verificar si el error es del endpoint de login
      const isLoginEndpoint = error.config?.url?.includes('/login') || error.config?.url === '/login';
      
      if (!isLoginEndpoint) {
        // Solo redirigir si NO es un error del endpoint de login
        // (para permitir que el componente LoginPage maneje el error)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirigir al login sin recargar la página completa
        window.location.href = '/login';
      } else {
        // Si es el endpoint de login, limpiar el token pero NO redirigir
        // para permitir que el componente maneje el error y muestre el mensaje
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    if (error.response?.status === 403) {
      // Error de autorización
      console.error('No autorizado para realizar esta acción');
    }
    return Promise.reject(error);
  }
);

export { BASE_URL, API_URL };
export default api; 