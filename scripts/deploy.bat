@echo off
setlocal enabledelayedexpansion

echo 🚀 Script de Deployment - Analizador de Sesgo de Género
echo ==================================================

if "%1"=="ngrok" goto :ngrok
if "%1"=="local" goto :local
if "%1"=="vercel" goto :vercel
if "%1"=="railway" goto :railway
goto :help

:ngrok
echo 📡 Configurando para ngrok...
echo ⚠️  Asegúrate de que ngrok esté corriendo en otra ventana
echo.
echo Por favor, ingresa la URL de ngrok (ej: https://abc123.ngrok.io):
set /p NGROK_URL=
if "!NGROK_URL!"=="" (
    echo ❌ Error: No se ingresó una URL válida
    exit /b 1
)

echo ✅ URL de ngrok: !NGROK_URL!

REM Crear archivo .env temporal
(
echo REACT_APP_API_MODE=ngrok
echo REACT_APP_BACKEND_URL=!NGROK_URL!
) > .env

echo ✅ Archivo .env creado con URL de ngrok
echo 🔄 Reiniciando servidor de desarrollo...
npm start
goto :end

:local
echo 🏠 Configurando para desarrollo local...

REM Crear archivo .env para desarrollo local
(
echo REACT_APP_API_MODE=development
echo REACT_APP_BACKEND_URL=http://localhost:8000
) > .env

echo ✅ Archivo .env creado para desarrollo local
echo 🔄 Reiniciando servidor de desarrollo...
npm start
goto :end

:vercel
echo ☁️ Preparando para deployment en Vercel...

REM Verificar que esté en un repositorio git
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: No estás en un repositorio git
    exit /b 1
)

REM Verificar que Vercel CLI esté instalado
vercel --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Instalando Vercel CLI...
    npm install -g vercel
)

echo 🚀 Iniciando deployment en Vercel...
vercel --prod
goto :end

:railway
echo 🚂 Preparando para deployment en Railway...

REM Verificar que Railway CLI esté instalado
railway --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Instalando Railway CLI...
    npm install -g @railway/cli
)

echo 🚀 Iniciando deployment en Railway...
cd backend
railway login
railway up
goto :end

:help
echo ❓ Uso: scripts\deploy.bat [opcion]
echo.
echo Opciones disponibles:
echo   ngrok    - Configurar para usar ngrok
echo   local    - Configurar para desarrollo local
echo   vercel   - Deployar frontend en Vercel
echo   railway  - Deployar backend en Railway
echo.
echo Ejemplos:
echo   scripts\deploy.bat ngrok
echo   scripts\deploy.bat vercel
exit /b 1

:end
echo ✅ ¡Deployment completado!
pause 