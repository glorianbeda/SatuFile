# Enhance Branding and UX

## Summary
Improve SatuFile's visual identity and user experience by adding brand logo, enhancing file preview functionality, improving download button UX, and fixing the All Files category filter.

## Background
- No logo currently appears in the header or browser tab
- Only PDF and images can be previewed, missing video/audio/document previews
- Download action uses an icon which is not clear to users
- "All Files" filter doesn't show accurate count and lacks "All" option

## Goals
1. **Add Branding**: Display long logo in header beside search bar, use icon logo for browser favicon
2. **Improve Preview**: Support preview for more file types (video, audio, text)
3. **Better Download UX**: Change download icon to a button with text "Download"
4. **Fix Category Filter**: Add "All" option and accurate file counts per category

## Non-Goals
- Redesigning the entire header
- Adding new file type support
- Changing the color scheme

## Proposal

### 1. Logo Integration
- Add long logo (`/public/logo-long.png`) to Header component, positioned before search bar
- Replace browser favicon with icon logo (`/public/logo-icon.png`)
- Update index.html title and meta tags

### 2. Enhanced File Preview
- Add video preview using HTML5 `<video>` for mp4, webm, mkv
- Add audio preview using HTML5 `<audio>` for mp3, wav, ogg
- Add text preview for txt, md, json, yaml files
- Keep current PDF and image preview

### 3. Download Button UX
- Replace download icon in FilePreviewModal with MUI Button
- Button text: "Download"
- Include DownloadIcon inside button for visual cue

### 4. Category Filter Improvements
- Add "All" option as first filter (clears category filter)
- Show accurate count of files per category from API
- Ensure clicking category filters the file list correctly

### 5. Share Management CRUD

Menambahkan fitur pengelolaan link share yang lebih lengkap dengan operasi CRUD dan folder sharing.

#### 5.1 Backend Changes
- **PUT /api/share**: Update expiration share link
- **GET /api/share/public**: Tambahkan support `subpath` untuk akses file dalam folder yang di-share
- Folder yang di-share otomatis membuat semua isi folder dapat diakses via link yang sama

#### 5.2 Frontend Changes
- **SharesPage.tsx**: Tambahkan tombol Edit untuk mengubah expiration
- **PublicSharePage.tsx**: 
  - Tampilkan daftar file/folder jika yang di-share adalah folder
  - Navigasi subfolder
  - Download file individual

#### 5.3 Folder Sharing Behavior
- Ketika folder di-share, SEMUA file dan subfolder di dalamnya otomatis bisa diakses
- User bisa navigasi dan download file individual via share link
- File yang ditambahkan ke folder setelah share dibuat tetap bisa diakses
