import React, { useState } from 'react';
import { Scale, Send, Loader2, AlertCircle, CheckCircle, Info, Cloud, Target } from 'lucide-react';
import { apiService } from '../services/api';

const Analyzer = () => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const results = await apiService.analyzeGenderBias(description.trim());
      setResults(results);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al analizar la descripción');
    } finally {
      setIsLoading(false);
    }
  };

  const getBiasLevel = (score) => {
    if (score >= 0.7) return { level: 'Alto', color: 'text-red-600', bg: 'bg-red-50' };
    if (score >= 0.4) return { level: 'Moderado', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Bajo', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const getRecommendations = (lexicalScore, contextualScore, detectedTerms) => {
    const recommendations = [];
    
    if (lexicalScore > 0.6) {
      recommendations.push('Revisa el uso de términos que puedan ser percibidos como masculinos o femeninos');
    }
    
    if (contextualScore > 0.6) {
      recommendations.push('Considera reescribir la descripción para hacerla más inclusiva');
    }
    
    if (detectedTerms?.masculino?.length > detectedTerms?.femenino?.length) {
      recommendations.push('La descripción contiene más términos masculinos. Considera balancear con términos neutrales');
    }
    
    if (detectedTerms?.femenino?.length > detectedTerms?.masculino?.length) {
      recommendations.push('La descripción contiene más términos femeninos. Considera balancear con términos neutrales');
    }
    
    if (lexicalScore < 0.3 && contextualScore < 0.3) {
      recommendations.push('¡Excelente! Tu descripción parece ser inclusiva');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Considera revisar la descripción para asegurar que sea completamente inclusiva');
    }
    
    return recommendations;
  };

  // Componente para mostrar términos detectados
  const DetectedTerms = ({ terms, title, color }) => {
    if (!terms || terms.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
          <Cloud className="h-4 w-4 mr-1" style={{ color: color }} />
          {title} ({terms.length})
        </h4>
        <div className="flex flex-wrap gap-1">
          {terms.map((term, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: `${color}20`,
                color: color
              }}
            >
              {term}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Scale className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Analizador de Sesgo de Género
        </h1>
        <p className="text-lg text-gray-600">
          Pega la descripción de tu oferta laboral y obtén un análisis detallado del sesgo de género
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción de la oferta laboral
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pega aquí la descripción completa de tu oferta laboral..."
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !description.trim()}
            className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Analizar Sesgo
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Overall Result */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resultado General</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Predicción final:</p>
                <p className={`text-2xl font-bold ${getBiasLevel(results.final_prediction).color}`}>
                  {getBiasLevel(results.final_prediction).level} sesgo
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Método usado: {results.method_used === 'ensemble' ? 'Ensemble (Lexical + RoBERTa)' : 'Solo Lexical'}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${getBiasLevel(results.final_prediction).bg}`}>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Lexical Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis Lexical</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Score de sesgo:</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${results.lexical_score * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {(results.lexical_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hits masculinos:</p>
                    <p className="text-lg font-semibold text-blue-600">{results.masculine_hits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hits femeninos:</p>
                    <p className="text-lg font-semibold text-pink-600">{results.feminine_hits}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nivel:</p>
                  <p className={`font-semibold ${getBiasLevel(results.lexical_score).color}`}>
                    {getBiasLevel(results.lexical_score).level}
                  </p>
                </div>
              </div>
            </div>

            {/* Contextual Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis Contextual (RoBERTa)</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Score de sesgo:</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-secondary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${results.contextual_score * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {(results.contextual_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Prob. Masculino:</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {(results.roberta_probabilities.masculine * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Prob. Femenino:</p>
                    <p className="text-lg font-semibold text-pink-600">
                      {(results.roberta_probabilities.feminine * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nivel:</p>
                  <p className={`font-semibold ${getBiasLevel(results.contextual_score).color}`}>
                    {getBiasLevel(results.contextual_score).level}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Terms */}
          {results.detected_terms && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Términos Detectados
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <DetectedTerms
                  terms={results.detected_terms.masculino}
                  title="Términos Masculinos"
                  color="#3B82F6"
                />
                <DetectedTerms
                  terms={results.detected_terms.femenino}
                  title="Términos Femeninos"
                  color="#EC4899"
                />
                <DetectedTerms
                  terms={results.detected_terms.neutral}
                  title="Términos Neutrales"
                  color="#10B981"
                />
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones</h3>
            <div className="space-y-3">
              {getRecommendations(results.lexical_score, results.contextual_score, results.detected_terms).map((rec, index) => (
                <div key={index} className="flex items-start">
                  <Info className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">¿Cómo funciona el análisis?</h3>
            <div className="space-y-3 text-blue-800">
              <p>
                <strong>Análisis Lexical:</strong> Evalúa la presencia de términos marcados como masculinos 
                o femeninos en el texto, contando palabras que pueden indicar sesgo de género según nuestro 
                lexicon especializado.
              </p>
              <p>
                <strong>Análisis Contextual (RoBERTa):</strong> Utiliza un modelo de inteligencia artificial 
                entrenado específicamente para detectar sesgos de género, analizando el significado completo 
                de la descripción.
              </p>
              <p>
                <strong>Ensemble:</strong> Combina ambos métodos para obtener una predicción más robusta, 
                dando mayor peso al análisis contextual cuando está disponible.
              </p>
              <p>
                <strong>Confianza:</strong> Indica qué tan confiable es el resultado basado en la 
                consistencia entre ambos métodos de análisis.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyzer; 