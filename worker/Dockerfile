# Use a small but sane base image
FROM python:3.12-slim

# Avoid .pyc files and enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system deps (add more only if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install --no-cache-dir uv

# Set workdir
WORKDIR /app

# Copy the rest of the project
COPY . .

# Install dependencies
RUN uv sync --frozen --no-dev

# Install the project itself (so fls-worker is on PATH)
RUN uv pip install . --system

# Default command
ENTRYPOINT ["fls-worker"]
