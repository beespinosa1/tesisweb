import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, AlertTriangle, Cloud, Activity } from 'lucide-react';
import { apiService } from '../services/api';

const Dashboard = () => {
  // URL real de Looker Studio
  const lookerStudioUrl = "https://lookerstudio.google.com/embed/reporting/0b8d0141-7af4-440c-9563-8fb79082f41c/page/r7rPF";
  
  const [analyzerInfo, setAnalyzerInfo] = useState(null);
  const [lexiconStats, setLexiconStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyzerInfo = async () => {
      try {
        const [analyzerInfo, lexiconStats] = await Promise.all([
          apiService.getAnalyzerInfo(),
          apiService.getLexiconStats()
        ]);
        setAnalyzerInfo(analyzerInfo);
        setLexiconStats(lexiconStats);
        setError(null);
      } catch (error) {
        console.error('Error fetching analyzer info:', error);
        setError('Error al cargar la información del analizador');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyzerInfo();
  }, []);

  // Componente de nube de palabras simple
  const WordCloud = ({ terms, title, color }) => {
    if (!terms || terms.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Cloud className="h-5 w-5 mr-2" style={{ color: color }} />
          {title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {terms.slice(0, 15).map((term, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${color}20`,
                color: color,
                fontSize: `${Math.max(12, 16 - index * 0.5)}px`
              }}
            >
              {term}
            </span>
          ))}
          {terms.length > 15 && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
              +{terms.length - 15} más
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <BarChart3 className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Dashboard de Sesgo de Género en TIC Ecuador
        </h1>
        <p className="text-lg text-gray-600">
          Estadísticas y tendencias sobre la brecha de género en el sector tecnológico
        </p>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del analizador...</p>
        </div>
      )}

      {/* Estado de error */}
      {error && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Información del Analizador */}
      {!loading && analyzerInfo && analyzerInfo.features && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="h-6 w-6 mr-2 text-primary-600" />
            Información del Analizador
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Características</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Análisis Lexical: {analyzerInfo.features.lexical_analysis ? 'Activado' : 'Desactivado'}
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${analyzerInfo.features.contextual_analysis ? "text-green-500" : "text-yellow-500"}`}>
                    {analyzerInfo.features.contextual_analysis ? '✓' : '⚠'}
                  </span>
                  Análisis Contextual (RoBERTa): {analyzerInfo.features.contextual_analysis ? 'Activado' : 'No disponible'}
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${analyzerInfo.features.ensemble_method ? "text-green-500" : "text-gray-400"}`}>
                    {analyzerInfo.features.ensemble_method ? '✓' : '○'}
                  </span>
                  Método Ensemble: {analyzerInfo.features.ensemble_method ? 'Activado' : 'Solo lexical'}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Modelos</h3>
              <ul className="space-y-2 text-gray-600">
                <li><strong>spaCy:</strong> {analyzerInfo.features.spacy_model}</li>
                <li><strong>RoBERTa:</strong> {analyzerInfo.features.roberta_model || 'No disponible'}</li>
                <li><strong>Versión:</strong> {analyzerInfo.model_version}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas del Lexicon */}
      {!loading && lexiconStats && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Términos Masculinos</p>
                <p className="text-2xl font-bold text-gray-900">{lexiconStats.masculine_terms_count}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-pink-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Términos Femeninos</p>
                <p className="text-2xl font-bold text-gray-900">{lexiconStats.feminine_terms_count}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Términos Neutrales</p>
                <p className="text-2xl font-bold text-gray-900">{lexiconStats.neutral_terms_count}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Términos</p>
                <p className="text-2xl font-bold text-gray-900">{lexiconStats.total_terms}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Looker Studio Embed */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Análisis Detallado - Looker Studio
        </h2>
        <div className="w-full h-[600px] rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={lookerStudioUrl}
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            title="Dashboard de Sesgo de Género"
          />
        </div>
      </div>

      {/* Nubes de Palabras del Lexicon */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Términos del Lexicon por Categoría
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <WordCloud
            terms={[
              "competitivo", "ambicioso", "líder", "analítico", "independiente",
              "lógico", "objetivo", "racional", "seguro", "dominante",
              "asertivo", "experto", "enérgico", "confiado", "agresivo"
            ]}
            title="Términos Masculinos"
            color="#3B82F6"
          />
          
          <WordCloud
            terms={[
              "colaborativo", "empático", "comprensivo", "cuidadoso", "sensible",
              "solidario", "compasivo", "amable", "paciente", "responsable",
              "cooperativo", "atento", "comunicativo", "inclusivo", "afectuoso"
            ]}
            title="Términos Femeninos"
            color="#EC4899"
          />
          
          <WordCloud
            terms={[
              "equipo", "personal", "plantilla", "se requiere", "se busca",
              "el/la", "elle", "grafías inclusivas", "profesional", "técnico"
            ]}
            title="Términos Neutrales"
            color="#10B981"
          />
        </div>
      </div>

      {/* Métricas Adicionales */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Ofertas con Sesgo</p>
              <p className="text-2xl font-bold text-gray-900">45%</p>
              <p className="text-xs text-gray-500">Basado en análisis previo</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Mejora Anual</p>
              <p className="text-2xl font-bold text-gray-900">+12%</p>
              <p className="text-xs text-gray-500">Lenguaje más inclusivo</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Empresas Analizadas</p>
              <p className="text-2xl font-bold text-gray-900">150+</p>
              <p className="text-xs text-gray-500">Sector TIC Ecuador</p>
            </div>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Sobre el Análisis de Sesgo de Género
        </h3>
        <div className="space-y-3 text-blue-800">
          <p>
            <strong>Método Lexical:</strong> Analiza la presencia de términos marcados como masculinos, 
            femeninos o neutrales en las descripciones de trabajo, proporcionando un score basado en 
            la frecuencia y distribución de estos términos.
          </p>
          <p>
            <strong>Método Contextual (RoBERTa):</strong> Utiliza un modelo de inteligencia artificial 
            entrenado específicamente para detectar sesgos de género en texto, analizando el contexto 
            completo de la descripción.
          </p>
          <p>
            <strong>Ensemble:</strong> Combina ambos métodos para obtener una predicción más robusta, 
            dando mayor peso al análisis contextual cuando está disponible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 