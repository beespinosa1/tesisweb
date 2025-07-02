@echo off
echo Iniciando Analizador de Sesgo de Genero...
echo.

echo Iniciando Backend (FastAPI)...
start "Backend" cmd /k "cd backend && python main.py"

echo Esperando 3 segundos para que el backend inicie...
timeout /t 3 /nobreak > nul

echo Iniciando Frontend (React)...
start "Frontend" cmd /k "npm start"

echo.
echo Aplicacion iniciada!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
pause 