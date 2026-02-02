## 1. Components

- [x] 1.1 Create `frontend/src/components/files/BackgroundContextMenu.tsx` with "New Folder", "Upload File", and "Refresh" options.
- [x] 1.2 Implement `handleNewFolder` callback in `BackgroundContextMenu`.
- [x] 1.3 Implement `handleUpload` callback in `BackgroundContextMenu`.
- [x] 1.4 Implement `handleRefresh` callback in `BackgroundContextMenu`.

## 2. Integration

- [x] 2.1 Update `frontend/src/features/files/FileList.tsx` to handle background `onContextMenu` event.
- [x] 2.2 Update `frontend/src/features/files/FileGrid.tsx` to handle background `onContextMenu` event.
- [x] 2.3 Prevent event propagation in `FileRow.tsx` and `FileGrid.tsx` items.
- [x] 2.4 Integrate `BackgroundContextMenu` into the main file view layout (likely `frontend/src/features/files/index.tsx` or similar container).

## 3. Verification

- [ ] 3.1 Verify right-click on empty space opens the new menu.
- [ ] 3.2 Verify right-click on a file still opens the file context menu.
- [ ] 3.3 Verify "New Folder" opens the dialog.
- [ ] 3.4 Verify "Upload File" triggers the upload flow.
