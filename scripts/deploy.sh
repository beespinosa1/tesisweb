#!/bin/bash

# Script de deployment para el Analizador de Sesgo de Género
# Uso: ./scripts/deploy.sh [opcion]

set -e

echo "🚀 Script de Deployment - Analizador de Sesgo de Género"
echo "=================================================="

case "$1" in
  "ngrok")
    echo "📡 Configurando para ngrok..."
    
    # Verificar que ngrok esté corriendo
    if ! curl -s http://localhost:4040/api/tunnels > /dev/null; then
      echo "❌ Error: ngrok no está corriendo"
      echo "Ejecuta: ngrok http 8000"
      exit 1
    fi
    
    # Obtener URL de ngrok
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ -z "$NGROK_URL" ]; then
      echo "❌ Error: No se pudo obtener la URL de ngrok"
      exit 1
    fi
    
    echo "✅ URL de ngrok: $NGROK_URL"
    
    # Crear archivo .env temporal
    cat > .env << EOF
REACT_APP_API_MODE=ngrok
REACT_APP_BACKEND_URL=$NGROK_URL
EOF
    
    echo "✅ Archivo .env creado con URL de ngrok"
    echo "🔄 Reiniciando servidor de desarrollo..."
    npm start
    ;;
    
  "local")
    echo "🏠 Configurando para desarrollo local..."
    
    # Crear archivo .env para desarrollo local
    cat > .env << EOF
REACT_APP_API_MODE=development
REACT_APP_BACKEND_URL=http://localhost:8000
EOF
    
    echo "✅ Archivo .env creado para desarrollo local"
    echo "🔄 Reiniciando servidor de desarrollo..."
    npm start
    ;;
    
  "vercel")
    echo "☁️ Preparando para deployment en Vercel..."
    
    # Verificar que esté en un repositorio git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
      echo "❌ Error: No estás en un repositorio git"
      exit 1
    fi
    
    # Verificar que Vercel CLI esté instalado
    if ! command -v vercel &> /dev/null; then
      echo "📦 Instalando Vercel CLI..."
      npm install -g vercel
    fi
    
    echo "🚀 Iniciando deployment en Vercel..."
    vercel --prod
    ;;
    
  "railway")
    echo "🚂 Preparando para deployment en Railway..."
    
    # Verificar que Railway CLI esté instalado
    if ! command -v railway &> /dev/null; then
      echo "📦 Instalando Railway CLI..."
      npm install -g @railway/cli
    fi
    
    echo "🚀 Iniciando deployment en Railway..."
    cd backend
    railway login
    railway up
    ;;
    
  *)
    echo "❓ Uso: ./scripts/deploy.sh [opcion]"
    echo ""
    echo "Opciones disponibles:"
    echo "  ngrok    - Configurar para usar ngrok"
    echo "  local    - Configurar para desarrollo local"
    echo "  vercel   - Deployar frontend en Vercel"
    echo "  railway  - Deployar backend en Railway"
    echo ""
    echo "Ejemplos:"
    echo "  ./scripts/deploy.sh ngrok"
    echo "  ./scripts/deploy.sh vercel"
    exit 1
    ;;
esac

echo "✅ ¡Deployment completado!" 