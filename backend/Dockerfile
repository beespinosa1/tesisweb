# syntax=docker/dockerfile:1.7
FROM python:3.13.4-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/hf-cache \
    TOKENIZERS_PARALLELISM=false \
    UVICORN_HOST=0.0.0.0 \
    UVICORN_PORT=8000 \
    UVICORN_WORKERS=1 \
    APP_MODULE=main:app

# Paquetes del sistema (ligeros) útiles para numpy/torch/transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    libstdc++6 libgomp1 curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala deps primero para aprovechar cache de capas
COPY requirements.txt .
RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    python -m spacy download es_core_news_md

# (Opcional) precargar modelos HF en build para mejorar cold start
ARG PRELOAD_MODELS=true
COPY preload_models.py ./preload_models.py
RUN if [ "$PRELOAD_MODELS" = "true" ]; then python preload_models.py || true; fi

# Usuario no-root
RUN useradd -ms /bin/bash appuser && \
    mkdir -p "$HF_HOME" && chown -R appuser:appuser "$HF_HOME" /app
USER appuser

# Copia el resto del proyecto
COPY . .

EXPOSE 8000

# Healthcheck simple contra /health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:${UVICORN_PORT}/health || exit 1

# Ejecuta Uvicorn (configurable por env UVICORN_WORKERS)
CMD ["sh", "-lc", "uvicorn $APP_MODULE --host $UVICORN_HOST --port $UVICORN_PORT --workers ${UVICORN_WORKERS}"]