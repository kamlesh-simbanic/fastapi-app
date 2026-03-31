# Stage 1: Build the Next.js frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend-app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Final image with Python and FastAPI
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies for MySQL
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the built frontend to the expected location
COPY --from=frontend-builder /frontend-app/out ./frontend/out

# Copy application code
COPY app ./app
COPY .env .

# Expose the port (Render/Railway use 8080/8000/10000)
ENV PORT=8000
EXPOSE 8000

# Run the application
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
