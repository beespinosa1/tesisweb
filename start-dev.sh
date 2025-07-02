#!/bin/bash

echo "Iniciando Analizador de Sesgo de Genero..."
echo

echo "Iniciando Backend (FastAPI)..."
cd backend && python main.py &
BACKEND_PID=$!

echo "Esperando 3 segundos para que el backend inicie..."
sleep 3

echo "Iniciando Frontend (React)..."
npm start &
FRONTEND_PID=$!

echo
echo "Aplicacion iniciada!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo
echo "Presiona Ctrl+C para detener ambos servicios"
echo

# Esperar a que el usuario presione Ctrl+C
trap "echo 'Deteniendo servicios...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 