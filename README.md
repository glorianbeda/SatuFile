# SatuFile

A modern cloud drive web application inspired by filebrowser.

## Features

- 📁 File/folder browsing with list and grid views
- 📤 File upload with drag & drop
- 🔐 User authentication with JWT
- 🎨 Modern UI with dark mode support
- 📱 Responsive design for mobile
- 🔒 Protected core folders (Documents, Pictures, Videos, Audio, Downloads)

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/satufile/satufile.git
cd satufile

# Start with Docker Compose
docker-compose up -d

# Access at http://localhost:8080
```

### Option 2: Manual

```bash
# Build the application
go build -o satufile

# Run with data directory
./satufile -r ./data -p 8080
```

## Default Credentials

On first run, a default admin account is created:

- **Username:** `admin`
- **Password:** `Admin123!`

> ⚠️ You will be prompted to change this password on first login.

## Core Folders

The following folders are automatically created and **cannot be deleted**:

| Folder | Purpose |
|--------|---------|
| Documents | Office documents, PDFs |
| Pictures | Images and photos |
| Videos | Video files |
| Audio | Music and audio files |
| Downloads | Downloaded files |

## File Permissions

Ensure the data directory is readable and writable by the user running SatuFile:

```bash
# Create data directory with proper permissions
mkdir -p ./data
chmod -R 755 ./data

# If running as a different user (e.g., in Docker)
chown -R $(whoami) ./data
```

> ⚠️ **Important:** If you encounter permission errors or files not loading, check that the SatuFile process has read/write access to the entire data directory.

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| SATUFILE_ADDRESS | 0.0.0.0 | Listen address |
| SATUFILE_PORT | 8080 | Listen port |
| SATUFILE_ROOT | . | Root data directory |
| SATUFILE_DATABASE | satufile.db | Database file path |

### CLI Flags

```bash
./satufile -a 0.0.0.0 -p 8080 -r ./data -d ./data/satufile.db
```

## Docker Deployment

### docker-compose.yml

```yaml
version: '3.8'
services:
  satufile:
    image: satufile:latest
    ports:
      - "8080:8080"
    volumes:
      - ./data:/data
    environment:
      - SATUFILE_ROOT=/data
```

### With Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name files.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 100M;
    }
}
```

## Development

```bash
# Backend
go run main.go

# Frontend
cd frontend
npm install
npm run dev
```

## License

MIT License
