## Why

When users double right-click (right-click twice in quick succession), the browser's native context menu may still appear, overriding the custom application context menu. This breaks the immersive experience and can be confusing. We need to ensure that the browser's context menu is suppressed even on repeated or rapid right-clicks.

## What Changes

- Implement a handler for the `contextmenu` event that robustly calls `preventDefault()` and `stopPropagation()`.
- Ensure this handler is attached to a container high enough in the DOM (e.g., the main app wrapper or `HomePage` root) to catch all events.
- Verify that state updates (opening/closing custom menu) do not inadvertently allow the native event to propagate during re-renders.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `ui`: Strengthen requirements for context menu suppression.

## Impact

- **Frontend**: `frontend/src/features/files/HomePage.tsx` (or potentially `App.tsx` if a global fix is preferred).
