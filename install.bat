@echo off
echo ========================================
echo Instalacion del Analizador de Sesgo de Genero
echo ========================================
echo.

echo [1/4] Instalando dependencias del Frontend...
npm install
if %errorlevel% neq 0 (
    echo Error instalando dependencias del frontend
    pause
    exit /b 1
)

echo.
echo [2/4] Instalando dependencias del Backend...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error instalando dependencias del backend
    pause
    exit /b 1
)

echo.
echo [3/4] Descargando modelo spaCy...
python -m spacy download es_core_news_md
if %errorlevel% neq 0 (
    echo Error descargando modelo spaCy
    pause
    exit /b 1
)

echo.
echo [4/4] Descargando stop words de NLTK...
python -c "import nltk; nltk.download('stopwords')"
if %errorlevel% neq 0 (
    echo Error descargando stop words
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Instalacion completada exitosamente!
echo ========================================
echo.
echo Para iniciar la aplicacion:
echo 1. Ejecuta: start-dev.bat
echo 2. O manualmente:
echo    - Backend: cd backend && python main.py
echo    - Frontend: npm start
echo.
echo URLs:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo.
pause 