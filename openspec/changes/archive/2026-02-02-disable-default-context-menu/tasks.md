## 1. Implementation

- [x] 1.1 In `frontend/src/features/files/HomePage.tsx`, modify `handleBgContextMenu` to call `e.preventDefault()` regardless of whether the background menu is enabled (it should be, but just to be explicit).
- [x] 1.2 In `frontend/src/features/files/HomePage.tsx`, ensure the main container Box (the drop zone) has `onContextMenu` attached and that this handler calls `e.preventDefault()`.
- [x] 1.3 Verify `FileList` and `FileGrid` context menu handlers also prevent default propagation.
- [x] 1.4 Add `e.stopPropagation()` to `handleBgContextMenu` and attach it to the parent wrapper Box to cover padding areas.

## 2. Verification

- [ ] 2.1 Right-click on empty space in file browser -> App's context menu appears, Browser's does NOT.
- [ ] 2.2 Right-click on a file -> App's file menu appears, Browser's does NOT.
