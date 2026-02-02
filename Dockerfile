# Build stage - Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend with increased memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Build stage - Backend
FROM golang:1.24-alpine AS backend-builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Build the binary with embedded frontend
RUN CGO_ENABLED=1 GOOS=linux go build -a -ldflags '-linkmode external -extldflags "-static"' -o satufile .

# Final stage
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS and curl for healthcheck
RUN apk add --no-cache ca-certificates curl

# Copy the binary from builder
COPY --from=backend-builder /app/satufile .

# Copy frontend assets directly from frontend-builder
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create data directory
RUN mkdir -p /data

# Set environment variables
ENV SATUFILE_ADDRESS=0.0.0.0
ENV SATUFILE_PORT=8080
ENV SATUFILE_ROOT=/data
ENV SATUFILE_DATABASE=/data/satufile.db

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run the application
CMD ["./satufile"]
