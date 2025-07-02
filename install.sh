#!/bin/bash

echo "========================================"
echo "Instalacion del Analizador de Sesgo de Genero"
echo "========================================"
echo

echo "[1/4] Instalando dependencias del Frontend..."
npm install
if [ $? -ne 0 ]; then
    echo "Error instalando dependencias del frontend"
    exit 1
fi

echo
echo "[2/4] Instalando dependencias del Backend..."
cd backend
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Error instalando dependencias del backend"
    exit 1
fi

echo
echo "[3/4] Descargando modelo spaCy..."
python -m spacy download es_core_news_md
if [ $? -ne 0 ]; then
    echo "Error descargando modelo spaCy"
    exit 1
fi

echo
echo "[4/4] Descargando stop words de NLTK..."
python -c "import nltk; nltk.download('stopwords')"
if [ $? -ne 0 ]; then
    echo "Error descargando stop words"
    exit 1
fi

cd ..

echo
echo "========================================"
echo "Instalacion completada exitosamente!"
echo "========================================"
echo
echo "Para iniciar la aplicacion:"
echo "1. Ejecuta: ./start-dev.sh"
echo "2. O manualmente:"
echo "   - Backend: cd backend && python main.py"
echo "   - Frontend: npm start"
echo
echo "URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"
echo 