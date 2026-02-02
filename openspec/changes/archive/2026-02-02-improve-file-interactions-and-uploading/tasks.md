## 1. UI Improvements

- [x] 1.1 In `frontend/src/components/files/FileIcon.tsx` (or where icons are rendered), implement a badge-style shared indicator. It should be a small circular icon at the bottom-left of the main file/folder icon.
- [x] 1.2 Remove the existing shared icon from next to the modified date in `FileRow.tsx` and `FileGrid.tsx`.

## 2. Interaction Model

- [x] 2.1 In `frontend/src/features/files/HomePage.tsx`, modify click handlers to support single-click selection and double-click opening.
- [x] 2.2 Implement `CTRL + Click` logic for multi-selection in `HomePage.tsx` / `FileList.tsx` / `FileGrid.tsx`.
- [x] 2.3 Implement a global keydown listener for `CTRL + A` to select all files in the current view.
- [x] 2.4 Add "Select All" and "Unselect All" buttons/links in the toolbar that appear only when selection is active.
- [x] 2.5 Implement long-press (hold) gesture for mobile multi-selection.

## 3. Background Uploading

- [x] 3.1 Investigate and ensure the resumable upload loop in `HomePage.tsx` continues when the tab is in the background. Verify if any UI-bound logic (like state updates) is causing throttling and decouple the core upload process where possible.

## 4. Verification

- [x] 4.1 Verify shared icon is correctly badges at bottom-left of file icons.
- [x] 4.2 Verify single-click selects and double-click opens items.
- [x] 4.3 Verify CTRL+Click and CTRL+A selection shortcuts.
- [x] 4.4 Verify long-press selection on touch devices.
- [x] 4.5 Verify uploads continue when switching tabs or minimizing browser.