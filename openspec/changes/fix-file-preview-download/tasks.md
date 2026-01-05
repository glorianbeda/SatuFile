# Tasks: Fix File Preview and Download Behavior

## 1. Remove Text Preview Support

- [x] 1.1 Remove `isText` variable and `textContent` state from FilePreviewModal
- [x] 1.2 Remove text content fetching logic from fetchMedia function
- [x] 1.3 Remove text preview UI section (pre element with textContent)
- [x] 1.4 Remove text extensions from preview check

---

## 2. Update Previewable File Types

- [x] 2.1 Update `FilePreviewModal.tsx` to define explicit previewable lists:
  - Images: jpg, jpeg, png, gif, webp, svg, bmp
  - Videos: mp4, webm, avi, mov, mkv
  - Audio: mp3, wav, ogg, m4a, flac
  - Documents: pdf
- [x] 2.2 Remove all text, code, config extensions from any preview logic

---

## 3. Update Context Menu Preview Logic

- [x] 3.1 Update `FileContextMenu.tsx` `isPreviewable` check with explicit extension lists
- [x] 3.2 Verify Preview menu only shows for images, videos, audio, PDF
- [x] 3.3 Verify Preview menu does NOT show for text, code, config files

---

## 4. Fix Direct Download Handler

- [x] 4.1 Update `HomePage.tsx` `handleDownload` function:
  - Remove `window.open()` approach
  - Implement blob download mechanism
  - Create anchor element with `download` attribute
  - Trigger click programmatically
- [x] 4.2 Verify download works from context menu
- [x] 4.3 Verify download works from preview modal button

---

## 5. Update File Click Behavior

- [x] 5.1 Update `handleFileClick` to check if file is previewable before opening modal
- [x] 5.2 Ensure non-previewable files do not trigger preview modal
- [x] 5.3 Verify folder clicks still work (navigate to folder)

---

## 6. Verification

- [x] 6.1 Preview modal opens only for images, videos, audio, PDF
- [x] 6.2 Preview modal does NOT open for text files (no slow loading)
- [x] 6.3 Preview modal does NOT open for code files
- [x] 6.4 Context menu Preview option only appears for previewable files
- [x] 6.5 Download from context menu triggers direct download (no new tab)
- [x] 6.6 Download from preview modal triggers direct download
- [x] 6.7 Toast message shows "Tidak ada preview untuk file ini" when clicking non-previewable files
- [x] 6.8 Download shows toast feedback (info + success/error)
- [x] 6.9 Go build passes
- [x] 6.10 Frontend build passes
