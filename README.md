# SatuFile

A modern cloud drive web application inspired by filebrowser.

## Features

- 📁 File/folder browsing with list and grid views
- 📤 File upload with drag & drop
- 🔐 User authentication with JWT (single-user deployment)
- 🎨 Modern UI with Material-UI
- 📱 Responsive design for mobile
- 🔒 Protected core folders (Documents, Pictures, Videos, Audio, Downloads)
- 🔗 Share links for files and folders
- 🌐 Multi-language support (English & Indonesian)
- 🗑️ Trash bin with restore capability
- 🔍 Global file search
- 📊 Storage usage analysis

## Quick Start

### Prerequisites

- [Go](https://go.dev/dl/) 1.21+ 
- [Node.js](https://nodejs.org/) 18+
- [PM2](https://pm2.keymetrics.io/) (install globally: `npm install -g pm2`)

### Installation

```bash
# Clone the repository
git clone https://github.com/satufile/satufile.git
cd satufile

# Create data directory
mkdir -p ./data

# Install frontend dependencies
cd frontend
npm install
cd ..

# Build the application
go build -o satufile .

# Create logs directory for PM2
mkdir -p ./logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process list for restart
pm2 save

# Setup startup script (run as root or with sudo)
pm2 startup
```

### Access

Access at http://localhost:8080

## Default Credentials

On first run, a default admin account is created:

- **Username:** `admin`
- **Password:** `Admin123!`

> ⚠️ You will be prompted to change this password on first login.

## Changing Admin Password

To change the admin password:

1. Log in with your current credentials
2. Go to **Settings** → **Keamanan** (Security)
3. Enter your current password and new password
4. Click **Simpan Perubahan** (Save Changes)

Or via command line:

```bash
# Change password (requires direct database access)
# This feature is not yet implemented in CLI
```

## Core Folders

The following folders are automatically created and **cannot be deleted**:

| Folder | Purpose |
|--------|---------|
| Documents | Office documents, PDFs |
| Pictures | Images and photos |
| Videos | Video files |
| Audio | Music and audio files |
| Downloads | Downloaded files |

## Share Links

SatuFile allows you to share files and folders via public links:

1. Right-click on any file or folder
2. Select **Share** from the context menu
3. Set expiration (optional)
4. Copy the generated link

Manage all your shares in **Settings** → **Share**

## Language Support

SatuFile supports multiple languages:

- 🇬🇧 **English** (en)
- 🇮🇩 **Bahasa Indonesia** (id)

To change language:

1. Go to **Settings** → **Profil** (Profile)
2. Select your preferred language from the dropdown
3. Changes apply immediately

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

## PM2 Deployment

### Ecosystem Configuration

The `ecosystem.config.js` file defines how PM2 manages the application:

```javascript
module.exports = {
  apps: [{
    name: "satufile",
    script: "./satufile",
    args: "--port ${PORT:-8080} --root ${SATUFILE_ROOT:-./data}",
    env: {
      NODE_ENV: "development",
      PORT: 8080,
      SATUFILE_ROOT: "./data",
    },
    env_production: {
      NODE_ENV: "production",
      SATUFILE_JWT_SECRET: "change-me-in-production-please",
    },
    instances: 1,
    max_memory_restart: "1G",
  }],
};
```

### PM2 Commands

```bash
# Start application
pm2 start ecosystem.config.js

# Start in production mode
pm2 start ecosystem.config.js --env production

# Restart application
pm2 restart satufile

# Reload (zero-downtime)
pm2 reload satufile

# Stop application
pm2 stop satufile

# View logs
pm2 logs satufile

# View logs with line limit
pm2 logs --lines 100

# Monitor in real-time
pm2 monit

# View process status
pm2 list
pm2 status

# Save current process list
pm2 save

# Restore saved processes
pm2 resurrect

# Setup startup script (run as root)
pm2 startup
sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# Delete from PM2
pm2 delete satufile
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

### Directory Structure

```
satufile/
├── satufile          # Compiled binary
├── ecosystem.config.js  # PM2 configuration
├── data/             # Data directory
├── logs/             # PM2 logs
├── frontend/         # Frontend source
└── package.json      # Frontend dependencies
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8080 | Listen port |
| SATUFILE_ROOT | ./data | Root data directory |
| SATUFILE_DATABASE | ./data/satufile.db | Database file path |
| SATUFILE_ADDRESS | 0.0.0.0 | Listen address |
| SATUFILE_JWT_SECRET | - | JWT secret (production) |
| NODE_ENV | development | Environment mode |

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
