# Change: Add Navigation and Protected Folders

## Why

User perlu:
1. Navigasi yang jelas (breadcrumb menunjukkan path saat ini, tombol back ke parent)
2. Folder terstruktur dan terlindungi untuk deployment production
3. Core folders tidak bisa dihapus oleh user

## What Changes

### 1. Navigation UI
- **Breadcrumb**: Menampilkan path saat ini (Home > Documents > Project)
- **Back Button**: Navigasi ke parent directory (disabled jika di root)

### 2. Protected Core Folders
Folder yang auto-dibuat saat startup dan tidak bisa dihapus:
- `Documents`
- `Pictures`  
- `Videos`
- `Audio`
- `Downloads`

### 3. Backend Proteksi
- Cek delete request: tolak jika target adalah core folder
- Startup script: buat folder jika belum ada

### 4. Docker Deployment
- README dengan instruksi `docker-compose`
- Volume mount untuk data persistence
- Auto-create folders on first run

## Technical Notes

> [!IMPORTANT]
> Core folders TIDAK bisa dihapus, hanya isi di dalamnya yang bisa dihapus.

### API Changes
| Endpoint | Change |
|----------|--------|
| DELETE /api/resources/{path} | Tolak jika path adalah core folder |

### Config
```yaml
# Bisa dikonfigurasi via env
SATUFILE_CORE_FOLDERS=Documents,Pictures,Videos,Audio,Downloads
```

## Impact
- New: `Breadcrumb.tsx` component
- Update: `HomePage.tsx` (add breadcrumb + back button)
- Update: `resources.delete.go` (protect core folders)
- Update: `cmd/root.go` (create folders on startup)
- New: `docker-compose.yml`
- New: `README.md` (installation guide)
