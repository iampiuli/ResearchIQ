FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# CPU-only torch first: the default wheel drags in gigabytes of CUDA libraries.
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu
COPY requirements.txt .
RUN pip install -r requirements.txt

# Bake the embedding model into the image so the first request doesn't download it.
ARG EMBEDDING_MODEL_NAME=all-MiniLM-L6-v2
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('${EMBEDDING_MODEL_NAME}')"

COPY app ./app

# Uploads and the vector store must live on a persistent volume (mounted at /data).
ENV UPLOAD_DIR=/data/uploads \
    CHROMA_PERSIST_DIR=/data/chroma \
    APP_ENV=production \
    DEBUG=false

# Render injects $PORT; default for local `docker run`.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
