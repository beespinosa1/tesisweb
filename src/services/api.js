import axios from 'axios';
import { axiosConfig } from '../config/api';

// Crear instancia de axios con configuración
const apiClient = axios.create({
  ...axiosConfig,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  },
  withCredentials: false
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Servicios de la API
export const apiService = {
  // Analizar sesgo de género
  analyzeGenderBias: async (description) => {
    const response = await apiClient.post('/api/analyze', { description });
    return response.data;
  },

  // Obtener información del analizador
  getAnalyzerInfo: async () => {
    const response = await apiClient.get('/api/analyzer/info');
    return response.data;
  },

  // Obtener estadísticas del lexicon
  getLexiconStats: async () => {
    const response = await apiClient.get('/api/lexicon/stats');
    return response.data;
  },

  // Verificar salud del servidor
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  }
};

export default apiClient; 