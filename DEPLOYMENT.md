# Guía de Deployment - Analizador de Sesgo de Género

## 🚀 Opciones de Deployment

### Opción 1: Frontend en Vercel + Backend con ngrok (Desarrollo)

#### 1. Configurar ngrok con URL fija
```bash
# Instalar ngrok y crear cuenta en ngrok.com
ngrok config add-authtoken TU_TOKEN_AQUI

# Usar subdominio fijo
ngrok http 8000 --subdomain=tu-nombre-backend
```

#### 2. Configurar variables de entorno en Vercel
En el dashboard de Vercel, agrega estas variables:
```
REACT_APP_API_MODE=ngrok
REACT_APP_BACKEND_URL=https://tu-nombre-backend.ngrok.io
```

#### 3. Deployar en Vercel
```bash
# Conectar tu repositorio de GitHub a Vercel
# Vercel detectará automáticamente que es un proyecto React
```

### Opción 2: Frontend + Backend en la nube (Producción)

#### Backend - Opciones gratuitas:

**Railway (Recomendado)**
1. Ve a [railway.app](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Selecciona la carpeta `backend`
4. Railway detectará automáticamente que es Python
5. Agrega las variables de entorno necesarias

**Render**
1. Ve a [render.com](https://render.com)
2. Crea un nuevo Web Service
3. Conecta tu repositorio de GitHub
4. Configura el comando: `python main.py`
5. Puerto: 8000

#### Frontend - Vercel
1. Configura las variables de entorno:
```
REACT_APP_API_MODE=production
REACT_APP_BACKEND_URL=https://tu-backend-en-railway.railway.app
```

## 📁 Estructura del Proyecto

```
tesisweb/
├── backend/           # Backend Python (FastAPI)
├── src/              # Frontend React
├── public/           # Archivos públicos
└── env.example       # Variables de entorno de ejemplo
```

## 🔧 Configuración Local

### 1. Crear archivo .env
Copia `env.example` a `.env` y configura:
```bash
REACT_APP_API_MODE=development
REACT_APP_BACKEND_URL=http://localhost:8000
```

### 2. Para usar ngrok localmente
```bash
REACT_APP_API_MODE=ngrok
REACT_APP_BACKEND_URL=https://tu-url-ngrok.ngrok.io
```

## 🌐 URLs de Producción

Una vez deployado, tu aplicación estará disponible en:
- **Frontend**: `https://tu-app.vercel.app`
- **Backend**: `https://tu-backend.railway.app` (o la URL que te dé tu proveedor)

## 🔄 Actualización de URLs

### Si cambias la URL de ngrok:
1. Actualiza la variable `REACT_APP_BACKEND_URL` en Vercel
2. O recrea el deployment

### Si cambias el backend en la nube:
1. Actualiza `REACT_APP_BACKEND_URL` en Vercel
2. El frontend se actualizará automáticamente

## 🛠️ Troubleshooting

### Error de CORS
Si ves errores de CORS, asegúrate de que el backend permita tu dominio de Vercel:
```python
# En backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://tu-app.vercel.app"  # Agregar tu dominio de Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Variables de entorno no se cargan
- Asegúrate de que las variables empiecen con `REACT_APP_`
- Reinicia el servidor de desarrollo después de cambiar `.env`
- En Vercel, verifica que las variables estén configuradas correctamente 