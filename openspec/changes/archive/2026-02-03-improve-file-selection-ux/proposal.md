## Why

The current file selection logic in the frontend is confusing for users. When one file is selected, subsequent single clicks on other files toggle their selection state instead of replacing the selection. This behavior differs from standard file explorers and makes it difficult to quickly switch between single file selections without using the ESC key or clicking empty space.

## What Changes

- **Refined Selection Logic**: Single clicks will now replace the previous selection by default, unless the CTRL/Meta key is held or a dedicated "Selection Mode" is active.
- **Selection Mode Support**: A way to explicitly enter a multi-select mode (e.g., via a long press on mobile or a toggle button) where single clicks always toggle.
- **Checkbox Selection**: (Optional/Design decision) Add visible checkboxes to items when in multi-select mode to make the interaction clearer.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `files`: Update file interaction requirements to include refined selection behavior.

## Impact

- `frontend/src/features/files/HomePage.tsx`
- `frontend/src/components/files/FileRow.tsx`
- `frontend/src/components/files/FileGrid.tsx`
