// Configuración de la API para diferentes entornos
const API_CONFIG = {
  // Desarrollo local
  development: {
    baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',
    timeout: 30000
  },
  
  // Desarrollo con ngrok
  ngrok: {
    baseURL: process.env.REACT_APP_BACKEND_URL || 'https://tu-url-ngrok.ngrok.io',
    timeout: 30000
  },
  
  // Producción (cuando tengas el backend en la nube)
  production: {
    baseURL: process.env.REACT_APP_BACKEND_URL || 'https://tu-backend-produccion.com',
    timeout: 30000
  }
};

// Determinar el entorno
const getEnvironment = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  // Para desarrollo, puedes cambiar manualmente aquí
  // También puedes usar variables de entorno
  if (process.env.REACT_APP_API_MODE === 'ngrok') {
    return 'ngrok';
  }
  
  return 'development'; // Cambia a 'ngrok' si usas ngrok
};

// Exportar la configuración actual
export const apiConfig = API_CONFIG[getEnvironment()];

// Función para crear URLs completas
export const createApiUrl = (endpoint) => {
  return `${apiConfig.baseURL}${endpoint}`;
};

// Configuración para axios
export const axiosConfig = {
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  }
}; 