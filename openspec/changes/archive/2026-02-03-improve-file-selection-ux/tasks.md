## 1. Selection State Management

- [x] 1.1 Introduce `isMultiSelectMode` state in `HomePage.tsx`
- [x] 1.2 Update `handleSelect` to manage the `isMultiSelectMode` flag (set true if > 1 item selected, set false if 0)

## 2. Refine Click Handlers

- [x] 2.1 Update `handleFileClick` in `HomePage.tsx` to follow standard desktop/mobile rules
- [x] 2.2 Update `handleGridFileClick` in `HomePage.tsx` to follow standard desktop/mobile rules
- [x] 2.3 Update `handleFileLongPress` and `handleGridFileLongPress` to explicitly enter `isMultiSelectMode`

## 3. UI Improvements (Optional but Recommended)

- [x] 3.1 Update `FileRow` and `FileGrid` items to show a checkbox when `isMultiSelectMode` is active
- [x] 3.2 Add a "Clear Selection" button to the `FolderToolbar` when items are selected

## 4. Verification

- [x] 4.1 Verify single click clears previous selection on desktop
- [x] 4.2 Verify CTRL + click toggles selection on desktop
- [x] 4.3 Verify long press starts selection mode on mobile
- [x] 4.4 Verify single click toggles when in selection mode
- [x] 4.5 Verify ESC or clicking empty space clears selection and exits mode
