## Why

Users currently lack a native-feeling "right-click anywhere" experience in the file browser. To access global actions like "New Folder" or "Upload File", they must navigate to the toolbar. Adding a background context menu (right-click on empty space) improves usability and matches user expectations from desktop file managers and Google Drive.

## What Changes

- Add a global `onContextMenu` listener to the file browser container.
- Create a new `BackgroundContextMenu` component for empty space interactions.
- Differentiate between clicking on a file/folder (existing menu) and clicking on the background (new menu).
- The new background menu will offer: "New Folder", "Upload File", and "Refresh".

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `ui`: Add background context menu behavior requirement.

## Impact

- **Frontend**: `FileGrid.tsx` / `FileList.tsx` will be modified to handle the new event. New component `BackgroundContextMenu.tsx` will be created.
- **Backend**: No impact.
