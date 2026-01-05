# Change: Add File Upload Handler

## Why

Sistem butuh kemampuan upload file dan folder ke storage. Ini adalah core feature dari file manager.

## What Changes

### Backend Handler
Buat endpoint untuk handle upload file dan folder:

- `POST /api/resources/{path}` - Upload file ke path tertentu
- `GET /api/resources/{path}` - List directory / get file info
- `DELETE /api/resources/{path}` - Delete file/folder
- `PATCH /api/resources/{path}` - Move/rename file

Path dengan trailing `/` akan membuat directory.

### Frontend (View Mode di Toolbar)
> [!IMPORTANT]
> User request: View mode toggle harus **sejajar dengan sort** di folder toolbar, bukan di settings.

Toolbar akan berisi:
- Sort (by name, date, size)
- View mode toggle (list/grid)
- Filter (opsional)

### Pattern (dari filebrowser-master)
```go
// Path with trailing / = create directory
if strings.HasSuffix(r.URL.Path, "/") {
    err := fs.MkdirAll(r.URL.Path, dirMode)
    return
}

// Otherwise, write file from request body
info, err := writeFile(fs, path, r.Body, fileMode, dirMode)
```

## Technical Notes

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/resources/{path} | Upload file ke path |
| POST | /api/resources/{path}/ | Create directory |
| GET | /api/resources/{path} | List directory / get file info |
| DELETE | /api/resources/{path} | Delete file/folder |
| PATCH | /api/resources/{path}?destination=&action= | Move/rename |

## Impact
- New: `files/` package untuk file operations
- New: `routes/api/resources*.go` handlers
- Update: Frontend file browser dengan view toggle di toolbar
