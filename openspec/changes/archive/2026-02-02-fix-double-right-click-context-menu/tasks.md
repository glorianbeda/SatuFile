## 1. Implementation

- [x] 1.1 In `frontend/src/features/files/HomePage.tsx`, modify `handleBgContextMenu` to be more robust by ensuring `e.preventDefault()` and `e.stopPropagation()` are called immediately.
- [x] 1.2 In `frontend/src/features/files/HomePage.tsx`, add a `useCallback` hook for `handleBgContextMenu` to prevent recreation on every render, which might help with event binding stability.
- [x] 1.3 Ensure the `Box` wrapper for "Main content" has `onContextMenu` attached and verify it covers the entire interactive area.
- [x] 1.4 Add `onContextMenu` suppression to `Menu` and its backdrop in `BackgroundContextMenu` and `FileContextMenu`.

## 2. Verification

- [ ] 2.1 Verify that a single right-click on the background opens the custom menu and suppresses the browser menu.
- [ ] 2.2 Verify that a double right-click (rapid clicks) on the background DOES NOT trigger the browser menu.
- [ ] 2.3 Verify that right-clicking while the custom menu is already open simply moves the custom menu or closes/reopens it without showing the browser menu.