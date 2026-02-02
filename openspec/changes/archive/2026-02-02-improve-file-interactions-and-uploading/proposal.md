## Why

The current file browser UI has several UX limitations:
1.  **Shared Indicators**: The "shared" icon is placed next to the modified date, making it less prominent and inconsistent with modern file managers.
2.  **Upload Reliability**: Uploads stop when the browser tab loses focus, causing frustration for users uploading large files.
3.  **Interaction Model**: Single-click opening of files/folders makes it difficult to select items without opening them, and doesn't match standard desktop file manager behavior.
4.  **Selection Efficiency**: Lack of standard keyboard shortcuts (CTRL+Click, CTRL+A) and touch-friendly multi-select (long press) hinders productivity.

## What Changes

- **Shared Icon UI**: Move the shared indicator to the bottom-left of the file/folder icon. It will be rendered as a circular badge (badge style) to be more visible.
- **Background Uploading**: Implement logic to ensure file uploads continue even when the tab is inactive (likely using Service Workers or ensuring the upload process is not throttled by browser focus state).
- **Double-Click Action**: Change the interaction model so that a single click selects an item, and a double-click opens it.
- **Enhanced Selection**:
    - Support `CTRL + Click` for multi-selection.
    - Support `CTRL + A` to select all files in the current view.
    - Implement "Long Press" (Hold) for mobile/touch selection.
    - Add "Select All" and "Unselect All" UI actions when items are selected.

## Capabilities

### New Capabilities

### Modified Capabilities
- `ui`: Update file interaction and badge display requirements.
- `files`: Update upload behavior to support background processing.

## Impact

- **Frontend**: `FileList.tsx`, `FileRow.tsx`, `FileGrid.tsx`, `HomePage.tsx` (selection and event handling), and the upload utility/logic.
- **Backend**: No direct impact expected, though ensuring the session remains valid for long background uploads is critical.
