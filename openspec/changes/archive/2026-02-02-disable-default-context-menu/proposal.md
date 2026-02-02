## Why

The current implementation of the background context menu allows the native browser context menu to appear when clicking on empty space if not explicitly prevented. This creates a confusing user experience where sometimes the app's menu appears and sometimes the browser's menu appears. We need to strictly disable the default context menu within the file browser area to ensure a consistent, app-like experience.

## What Changes

- Add a global `onContextMenu` handler to the main app container or the file browser layout that calls `preventDefault()` on the event.
- Ensure that this handler is placed high enough in the DOM tree to catch all right-clicks within the application's interactive area.
- Verify that this does not interfere with input fields where a native context menu might be desirable (though in a file manager app, this is often disabled globally or strictly controlled).

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `ui`: Update requirements to explicitly forbid native context menus in the file browser area.

## Impact

- **Frontend**: `frontend/src/features/files/HomePage.tsx` (or the layout wrapper).
