# Analizador de Sesgo de Género en Ofertas Laborales

Una aplicación web completa para detectar y analizar el sesgo de género en ofertas laborales del sector TIC en Ecuador, utilizando análisis lexical y modelo RoBERTa.

## 🚀 Características

- **Análisis Lexical Avanzado**: Detecta términos marcados como masculinos, femeninos o neutrales usando un lexicon especializado
- **Análisis Contextual con RoBERTa**: Utiliza IA para evaluar el sesgo de manera sofisticada
- **Método Ensemble**: Combina ambos análisis para predicciones más robustas
- **Dashboard Interactivo**: Visualización con Looker Studio integrado
- **Nubes de Palabras**: Visualización de términos detectados
- **Interfaz Moderna**: Diseño responsive y accesible
- **API REST Completa**: Backend robusto con FastAPI

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- Tailwind CSS
- Lucide React (iconos)
- Axios (HTTP client)
- React Router DOM

### Backend
- FastAPI
- Python 3.8+
- spaCy (procesamiento de lenguaje natural)
- Transformers (modelo RoBERTa)
- NLTK (stop words)
- Pydantic (validación de datos)
- Uvicorn (servidor ASGI)

## 📋 Requisitos Previos

- Node.js 16+ y npm
- Python 3.8+
- pip (gestor de paquetes de Python)

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Recomendado)

**Windows:**
```bash
install.bat
```

**Unix/Linux/macOS:**
```bash
chmod +x install.sh
./install.sh
```

### Opción 2: Instalación Manual

#### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd tesisweb
```

#### 2. Configurar el Frontend
```bash
npm install
```

#### 3. Configurar el Backend
```bash
cd backend
pip install -r requirements.txt
python -m spacy download es_core_news_md
python -c "import nltk; nltk.download('stopwords')"
cd ..
```

## 🚀 Iniciar la Aplicación

### Opción 1: Script Automático
```bash
# Windows
start-dev.bat

# Unix/Linux/macOS
chmod +x start-dev.sh
./start-dev.sh
```

### Opción 2: Manual
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
npm start
```

## 📊 URLs de Acceso
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📁 Estructura del Proyecto

```
tesisweb/
├── public/                 # Archivos públicos de React
├── src/                    # Código fuente del frontend
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas principales
│   ├── App.js             # Componente principal
│   └── index.js           # Punto de entrada
├── backend/               # Código del backend
│   ├── main.py            # Servidor FastAPI
│   ├── gender_bias_analyzer.py  # Analizador principal
│   ├── lexicon_definitivo.csv   # Lexicon de términos
│   └── requirements.txt   # Dependencias de Python
├── package.json           # Configuración de React
├── tailwind.config.js     # Configuración de Tailwind
├── install.bat            # Script de instalación Windows
├── install.sh             # Script de instalación Unix
├── start-dev.bat          # Script de inicio Windows
├── start-dev.sh           # Script de inicio Unix
└── README.md              # Este archivo
```

## 🔧 Características del Analizador

### Análisis Lexical
- **Lexicon Especializado**: 33 términos masculinos, 25 femeninos, 10 neutrales
- **Lematización**: Procesamiento avanzado de texto con spaCy
- **Normalización**: Eliminación de tildes y caracteres especiales
- **Stop Words**: Filtrado de palabras comunes en español

### Análisis Contextual (RoBERTa)
- **Modelo**: PlanTL-GOB-ES/roberta-base-bne (español)
- **Clasificación**: Binaria (masculino/femenino)
- **Contexto**: Análisis semántico completo del texto

### Método Ensemble
- **Combinación**: 40% lexical + 60% contextual
- **Predicción**: Usa el método con mayor confianza
- **Fallback**: Solo lexical si RoBERTa no está disponible

## 📝 API Endpoints

### POST /api/analyze
Analiza el sesgo de género en una descripción de oferta laboral.

**Request:**
```json
{
  "description": "Descripción de la oferta laboral"
}
```

**Response:**
```json
{
  "lexical_score": 0.75,
  "contextual_score": 0.68,
  "final_prediction": 0.72,
  "method_used": "ensemble",
  "confidence": 0.85,
  "masculine_hits": 3,
  "feminine_hits": 1,
  "detected_terms": {
    "masculino": ["competitivo", "líder", "analítico"],
    "femenino": ["colaborativo"],
    "neutral": ["equipo"]
  },
  "roberta_probabilities": {
    "masculine": 0.68,
    "feminine": 0.32
  }
}
```

### GET /api/analyzer/info
Obtiene información sobre el analizador y modelos cargados.

### GET /api/lexicon/stats
Obtiene estadísticas del lexicon cargado.

### GET /health
Verifica el estado del servidor.

## 🎨 Características del Frontend

### Página de Inicio
- Información sobre sesgo de género en TIC Ecuador
- Contexto del problema y soluciones
- Navegación a las herramientas

### Analizador
- Formulario para ingresar descripciones
- Análisis en tiempo real
- Visualización de scores con barras de progreso
- Términos detectados con nubes de palabras
- Recomendaciones personalizadas

## 🚀 Deployment

### Opción 1: Frontend en Vercel + Backend con ngrok (Desarrollo)

```bash
# 1. Configurar ngrok con URL fija
ngrok config add-authtoken TU_TOKEN_AQUI
ngrok http 8000 --subdomain=tu-nombre-backend

# 2. Usar script de deployment
scripts\deploy.bat ngrok  # Windows
./scripts/deploy.sh ngrok  # Unix/Linux/macOS
```

### Opción 2: Frontend + Backend en la nube (Producción)

```bash
# Deployar backend en Railway
scripts\deploy.bat railway  # Windows
./scripts/deploy.sh railway  # Unix/Linux/macOS

# Deployar frontend en Vercel
scripts\deploy.bat vercel  # Windows
./scripts/deploy.sh vercel  # Unix/Linux/macOS
```

### Configuración de Variables de Entorno

Crea un archivo `.env` basado en `env.example`:

```bash
# Para desarrollo local
REACT_APP_API_MODE=development
REACT_APP_BACKEND_URL=http://localhost:8000

# Para ngrok
REACT_APP_API_MODE=ngrok
REACT_APP_BACKEND_URL=https://tu-url-ngrok.ngrok.io

# Para producción
REACT_APP_API_MODE=production
REACT_APP_BACKEND_URL=https://tu-backend-produccion.com
```

📖 **Ver [DEPLOYMENT.md](DEPLOYMENT.md) para instrucciones detalladas.**
- Explicación detallada del proceso

### Dashboard
- Información del analizador y modelos
- Estadísticas del lexicon
- Integración con Looker Studio
- Nubes de palabras por categoría
- Métricas adicionales

## 🔮 Próximas Mejoras

- [ ] Integración con más modelos de IA
- [ ] Análisis de imágenes en ofertas laborales
- [ ] Exportación de reportes en PDF
- [ ] Dashboard más interactivo con gráficos
- [ ] API para análisis en lote
- [ ] Historial de análisis
- [ ] Comparación de ofertas
- [ ] Recomendaciones más específicas

## 🧪 Testing

### Probar el Backend
```bash
cd backend
python gender_bias_analyzer.py
```

### Probar la API
```bash
# Verificar que el servidor esté corriendo
curl http://localhost:8000/health

# Probar el análisis
curl -X POST "http://localhost:8000/api/analyze" \
     -H "Content-Type: application/json" \
     -d '{"description": "Buscamos un desarrollador agresivo y competitivo"}'
```

## 🚀 Despliegue

### Frontend (Producción)
```bash
npm run build
```

### Backend (Producción)
```bash
# Usar Gunicorn para producción
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de la API en `http://localhost:8000/docs`
2. Verifica los logs del servidor
3. Asegúrate de que todas las dependencias estén instaladas correctamente
4. Ejecuta los scripts de instalación si es necesario

## 🔍 Troubleshooting

### Error: "No module named 'spacy'"
```bash
cd backend
pip install spacy
python -m spacy download es_core_news_md
```

### Error: "No module named 'nltk'"
```bash
cd backend
pip install nltk
python -c "import nltk; nltk.download('stopwords')"
```

### Error: "No module named 'transformers'"
```bash
cd backend
pip install transformers torch
```

### Error: "spaCy model not found"
```bash
cd backend
python -m spacy download es_core_news_md
``` 