# Change: Enhance File Operations

## Why

Menambahkan operasi file lengkap untuk pengalaman file manager yang komprehensif.

## What Changes

### 1. Create Button Enhancement

Gabungkan Upload + Create Folder dalam satu dropdown menu:

- `+ Create` button dengan dropdown:
  - Upload File(s)
  - New Folder

### 2. File Operations

| Operation | Backend | Frontend |
|-----------|---------|----------|
| Download | GET /api/raw/* | Download button/link |
| Delete | DELETE /api/resources/* | ✅ (sudah ada) |
| Rename | PATCH /api/resources/* | Rename dialog |

### 3. File Preview

Klik file membuka preview modal:

- **Images**: Tampilkan langsung
- **PDF**: Embed PDF viewer
- **Audio/Video**: HTML5 player
- **Text/Code**: Syntax highlighted viewer

### 4. Grid View Enhancement

- Image thumbnail preview
- Vertical 3-dot menu (⋮) untuk:
  - Download
  - Rename
  - Delete

### 5. Storage Usage (Real)

Backend endpoint untuk baca ukuran storage:

```
GET /api/storage
→ { used: 1234567890, folders: {...} }
```

## Technical Notes

> [!IMPORTANT]
> Download menggunakan `/api/raw/*` untuk streaming file content.

## Impact

- Update: `Header.tsx` (Create dropdown)
- New: `FilePreviewModal.tsx` (preview images, pdf, audio)
- New: `RenameDialog.tsx`
- New: `FileContextMenu.tsx` (3-dot menu)
- Update: `FileGrid.tsx` (thumbnails + menu)
- Update: `StoragePanel.tsx` (real data)
- New: `routes/api/raw.go` (file download)
- New: `routes/api/storage.go` (storage stats)
