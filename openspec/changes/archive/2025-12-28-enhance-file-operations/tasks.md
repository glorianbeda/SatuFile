# Tasks: Enhance File Operations

## 1. Create Button Dropdown

- [x] 1.1 Update Header with Create dropdown (Upload + New Folder)
- [x] 1.2 Create `NewFolderDialog` component
- [x] 1.3 Connect to POST /api/resources/{path}/

---

## 2. File Download

- [x] 2.1 Create `routes/api/raw.go` for file streaming
- [x] 2.2 Register GET /api/raw/* route
- [x] 2.3 Add download button/link to file items

---

## 3. Rename Operation

- [x] 3.1 Create PATCH handler in resources.go
- [x] 3.2 Create `RenameDialog.tsx` component
- [x] 3.3 Connect rename to API

---

## 4. File Preview Modal

- [x] 4.1 Create `FilePreviewModal.tsx`
- [x] 4.2 Image preview support
- [x] 4.3 PDF embed viewer
- [x] 4.4 Audio/Video HTML5 player
- [x] 4.5 Integrate with file click handler

---

## 5. Grid View Enhancement

- [x] 5.1 Add image thumbnail preview in grid
- [x] 5.2 Create `FileContextMenu.tsx` (3-dot menu)
- [x] 5.3 Add onMenuClick callback to FileGrid items
- [x] 5.4 Wire context menu in HomePage

---

## 6. Storage Usage API

- [x] 6.1 Create `routes/api/storage.go`
- [x] 6.2 Calculate folder sizes recursively
- [x] 6.3 Update `StoragePanel` to fetch real data

---

## 7. Verification

- [x] 7.1 Go build passes
- [x] 7.2 Frontend build passes
