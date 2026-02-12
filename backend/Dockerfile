# ============================================
# LegalGuard AI - Production Dockerfile
# Optimized for Render deployment
# ============================================

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for tesseract, opencv, and image processing
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-tam \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Download additional Tesseract language data if needed
RUN mkdir -p /usr/share/tesseract-ocr/4.00/tessdata
WORKDIR /usr/share/tesseract-ocr/4.00/tessdata
RUN wget -q https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata || true
RUN wget -q https://github.com/tesseract-ocr/tessdata/raw/main/tam.traineddata || true

# Set Tesseract data path environment variable
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata

# Return to app directory
WORKDIR /app

# Copy requirements first (for layer caching)
COPY requirements.txt .

# Upgrade pip and install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/uploads /app/reports

# Expose port (Render will set PORT env variable)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/v1/stats')" || exit 1

# Run the application with uvicorn
# Render sets $PORT, we bind to 0.0.0.0 to accept external connections
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2
