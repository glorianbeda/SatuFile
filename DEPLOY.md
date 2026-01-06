# 📦 Deploy SatuFile dengan Cloudflared (Manual & Stabil)

Dokumentasi ini menjelaskan cara **men-deploy SatuFile** agar bisa diakses dari internet menggunakan **Cloudflare Tunnel (cloudflared)** secara **manual namun aman**.

## 🏗️ Arsitektur

```
Internet
 → Cloudflare DNS
 → Cloudflared Tunnel
 → Traefik (port 80)
 → SatuFile Container (port 8080)
```

---

## 🧩 Prasyarat

- Docker & Docker Compose sudah terinstall
- Traefik sudah berjalan di port `80`
- Cloudflared sudah terinstall via `apt`
- Tunnel Cloudflare sudah dibuat & aktif
- Domain sudah terhubung ke Cloudflare
- Network `proxy` sudah dibuat (`docker network create proxy`)

---

## 1️⃣ Clone Repository SatuFile

```bash
# Clone repository
git clone https://github.com/satufile/satufile.git
cd satufile
```

---

## 2️⃣ Konfigurasi Docker Compose

File `docker-compose.yml` sudah tersedia dengan konfigurasi Traefik:

```yaml
services:
  satufile:
    build: .
    container_name: satufile
    restart: unless-stopped
    networks:
      - proxy
    ports:
      - "8080:8080"
    environment:
      - SATUFILE_ADDRESS=0.0.0.0
      - SATUFILE_PORT=8080
      - SATUFILE_ROOT=/data
      - SATUFILE_DATABASE=/data/satufile.db
    volumes:
      - ./data:/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.satufile.rule=Host(`satufile.gbeda.my.id`)"
      - "traefik.http.routers.satufile.entrypoints=web"
      - "traefik.http.services.satufile.loadbalancer.server.port=8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

networks:
  proxy:
    external: true
```

### Sesuaikan Hostname

Ganti `satufile.gbeda.my.id` dengan subdomain yang Anda inginkan:

```bash
# Edit docker-compose.yml
nano docker-compose.yml

# Ubah baris ini sesuai domain Anda:
# - "traefik.http.routers.satufile.rule=Host(`satufile.your-domain.com`)"
```

---

## 3️⃣ Siapkan Direktori Data

```bash
# Buat direktori data dengan permission yang benar
mkdir -p ./data
chmod -R 755 ./data
```

---

## 4️⃣ Build dan Jalankan Container

```bash
# Build image (pertama kali)
docker compose build

# Jalankan container
docker compose up -d

# Cek status
docker compose ps

# Lihat logs
docker compose logs -f satufile
```

---

## 5️⃣ Buat Subdomain dengan Cloudflared

```bash
cloudflared tunnel route dns homeserver satufile.gbeda.my.id
```

> ⚠️ Ganti `homeserver` dengan nama tunnel Anda dan `satufile.gbeda.my.id` dengan subdomain yang diinginkan.

---

## 6️⃣ Edit Config Cloudflared

Lokasi file:
```bash
sudo nano /etc/cloudflared/config.yml
```

Tambahkan entry untuk SatuFile:

```yaml
tunnel: homeserver
credentials-file: /root/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: traefik.gbeda.my.id
    service: http://127.0.0.1:80

  - hostname: satufile.gbeda.my.id
    service: http://127.0.0.1:80

  # ... hostname lainnya ...

  - service: http_status:404
```

---

## 7️⃣ Restart Cloudflared

```bash
sudo systemctl restart cloudflared
```

Cek status:
```bash
sudo systemctl status cloudflared --no-pager
```

---

## 8️⃣ Test Akses

Buka browser:
```
http://satufile.gbeda.my.id
```

### Default Login

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `Admin123!` |

> ⚠️ Anda akan diminta untuk mengganti password saat login pertama kali.

---

## 🔄 Update SatuFile

```bash
# Pull perubahan terbaru
git pull origin main

# Rebuild dan restart
docker compose build
docker compose up -d
```

---

## 🔧 Troubleshooting

### Container tidak berjalan
```bash
# Cek logs
docker compose logs satufile

# Restart container
docker compose restart satufile
```

### Permission error pada data directory
```bash
# Fix permissions
sudo chown -R $(whoami):$(whoami) ./data
chmod -R 755 ./data
```

### Healthcheck gagal
```bash
# Test healthcheck manual
curl -f http://localhost:8080/health
```

### Tidak bisa diakses dari internet
1. Pastikan container running: `docker compose ps`
2. Pastikan DNS sudah dibuat: `cloudflared tunnel route dns`
3. Pastikan config cloudflared sudah di-update
4. Pastikan cloudflared sudah di-restart

---

## ✅ Checklist Deployment

- [ ] Repository cloned
- [ ] Data directory dibuat dengan permission benar
- [ ] Container running (`docker compose ps`)
- [ ] DNS subdomain dibuat via cloudflared
- [ ] Config cloudflared di-update dengan hostname baru
- [ ] Cloudflared di-restart
- [ ] Service bisa diakses dari browser
- [ ] Login berhasil dengan default credentials
- [ ] Password admin sudah diganti

---

## 📊 Environment Variables

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| SATUFILE_ADDRESS | 0.0.0.0 | Alamat listen |
| SATUFILE_PORT | 8080 | Port listen |
| SATUFILE_ROOT | /data | Direktori root data |
| SATUFILE_DATABASE | /data/satufile.db | Path file database |

---

## 🔒 Keamanan

1. **Ganti password default** setelah login pertama
2. **Backup data** secara berkala: `cp -r ./data ./data-backup-$(date +%Y%m%d)`
3. **Gunakan HTTPS** jika Cloudflare Tunnel sudah dikonfigurasi dengan SSL

---

✍️ Author: SatuFile Team  
🗓️ 2026
