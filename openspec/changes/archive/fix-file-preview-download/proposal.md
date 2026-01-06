# Change: Fix File Preview and Download Behavior

## Why

Preview modal saat ini mendukung text files yang menyebabkan loading lama untuk file besar (txt, md, json, dll). Selain itu, tombol download membuka file di tab baru alih-alih mendownload langsung. Perlu pembatasan jenis file yang bisa di-preview dan perbaikan mekanisme download.

## What Changes

### 1. Restrict File Preview Support

Hanya jenis file berikut yang bisa di-preview di modal:

- **Images**: jpg, jpeg, png, gif, webp, svg, bmp
- **Videos**: mp4, webm, avi, mov, mkv
- **Audio**: mp3, wav, ogg, m4a, flac
- **Documents**: pdf

**Hapus support untuk:**
- Text files (txt, md, log)
- Code files (js, ts, py, go, sh, html, css, etc.)
- Config files (json, yaml, xml, csv)
- Document files (doc, docx, xls, xlsx, ppt, pptx)

### 2. Fix Download Behavior

Ganti `window.open()` dengan direct download:

- Download dari context menu → Trigger direct download (bukan buka tab baru)
- Download dari preview modal → Tetap direct download
- Gunakan `download` attribute pada anchor element
- Fetch file sebagai blob dan create temporary URL untuk download

### 3. Update Context Menu Logic

Menu "Preview" hanya muncul untuk file yang previewable:
- Images, videos, audio, PDF → Ada menu "Preview"
- Text, code, binary, dll → Hanya menu "Download" (tanpa "Preview")

## Technical Notes

> [!IMPORTANT]
> - Hapus `isText` flag dan `textContent` state dari FilePreviewModal
> - Gunakan list explicit extension untuk `isPreviewable` check
> - Implement direct download dengan blob + anchor element

## Impact

- Update: `frontend/src/components/files/FilePreviewModal.tsx` (remove text support)
- Update: `frontend/src/components/files/FileContextMenu.tsx` (update previewable types)
- Update: `frontend/src/features/files/HomePage.tsx` (fix download handler)
- Update: `openspec/specs/files/spec.md` (update preview and download requirements)
