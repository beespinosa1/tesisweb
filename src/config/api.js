// Configuración de la API para diferentes entornos
const API_CONFIG = {
  // Desarrollo local
  development: {
    baseURL: 'http://localhost:8000',
    timeout: 30000
  },

  // Producción (Railway)
  production: {
    baseURL: 'https://tesisweb-production.up.railway.app', // <-- URL correcta del backend
    timeout: 30000
  }
};

// Determinar el entorno
const getEnvironment = () => {
  const mode = process.env.REACT_APP_API_MODE;
  if (mode === 'production') return 'production';
  return 'development';
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
