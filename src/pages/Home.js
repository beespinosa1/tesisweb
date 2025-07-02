import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, AlertTriangle, TrendingUp, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="mb-8">
          <Scale className="h-20 w-20 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Analizador de Sesgo de Género
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Detecta y analiza el sesgo de género en ofertas laborales del sector TIC en Ecuador
          </p>
          <Link
            to="/analyzer"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Scale className="h-5 w-5 mr-2" />
            Analizar Oferta
          </Link>
        </div>
      </div>

      {/* Problem Section */}
      <div className="mb-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              ¿Por qué es importante detectar el sesgo de género?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                El problema en el sector TIC
              </h3>
              <p className="text-gray-600 mb-4">
                El sector de Tecnologías de la Información y Comunicación (TIC) 
                en Ecuador presenta una brecha significativa de género. Las mujeres 
                representan solo el 30% de los profesionales en este campo, y una 
                de las causas principales es el sesgo en las ofertas laborales.
              </p>
              <p className="text-gray-600">
                Las descripciones de trabajo pueden contener lenguaje que, de manera 
                sutil o explícita, desalienta a las mujeres a postularse, perpetuando 
                la desigualdad en el sector.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Tipos de sesgo detectados
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Lenguaje masculinizado (ej: "líder agresivo", "competitivo")</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Requisitos innecesariamente específicos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Descripciones que enfatizan características estereotípicas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Falta de inclusión en el lenguaje corporativo</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Nuestras herramientas
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Scale className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Análisis Lexical
            </h3>
            <p className="text-gray-600">
              Detecta términos marcados como masculinos o femeninos en el texto, 
              proporcionando un score basado en la frecuencia de palabras sesgadas.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <TrendingUp className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Modelo Contextual
            </h3>
            <p className="text-gray-600">
              Utiliza inteligencia artificial para analizar el contexto completo 
              de la descripción y evaluar el sesgo de manera más sofisticada.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Dashboard Interactivo
            </h3>
            <p className="text-gray-600">
              Visualiza estadísticas y tendencias sobre el sesgo de género en 
              el sector TIC de Ecuador con datos actualizados.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg shadow-lg p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">
          ¿Listo para analizar tu oferta laboral?
        </h2>
        <p className="text-lg mb-6 opacity-90">
          Descubre si tu descripción de trabajo es inclusiva y atractiva para todos los géneros
        </p>
        <Link
          to="/analyzer"
          className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Scale className="h-5 w-5 mr-2" />
          Comenzar Análisis
        </Link>
      </div>
    </div>
  );
};

export default Home; 