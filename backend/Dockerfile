# Imagen base oficial de Python
FROM python:3.11-slim

# Evita prompts interactivos
ENV DEBIAN_FRONTEND=noninteractive

# Instala dependencias necesarias para compilar paquetes pesados como pandas y sklearn
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    python3-dev \
    libatlas-base-dev \
    libopenblas-dev \
    liblapack-dev \
    gfortran \
    && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo
WORKDIR /app

# Copia e instala dependencias
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código
COPY . .

# Expone el puerto que Railway usará
EXPOSE 8000

# Comando para correr el backend con gunicorn (Flask)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]