## Context

The current file browser uses a simple interaction model where single-clicking a file or folder immediately opens it. This is counter-intuitive for users coming from desktop environments where single-click is for selection and double-click is for opening. Additionally, the "shared" indicator is poorly placed, and uploads are sensitive to tab focus.

## Goals / Non-Goals

**Goals:**
- Implement a double-click interaction model for opening items.
- Improve shared status visibility with a badge-style icon on the file/folder icon itself.
- Ensure uploads continue in the background.
- Support standard multi-selection shortcuts (CTRL+Click, CTRL+A).
- Add touch-friendly long-press selection.

**Non-Goals:**
- Changing the backend storage or sharing logic.
- Implementing complex drag-and-drop selection (marquee selection) for now.

## Decisions

### 1. Badge-style Shared Icon
We will use MUI's `Badge` component or a custom positioned `Box` to place the shared icon at the bottom-left of the main icon in `FileIcon.tsx` or similar.
- **Style**: Circular background, small icon, high contrast.

### 2. Interaction State Management
- **Single Click**: Toggles selection. We need to manage `selectedFiles` state in `HomePage.tsx` more effectively.
- **Double Click**: Triggers the open action. We will use the `onDoubleClick` event in React.
- **Propagation**: Ensure clicks on the checkbox or the "More" menu do not trigger selection/opening unexpectedly.

### 3. Selection Shortcuts
- **CTRL + Click**: Check `event.ctrlKey` in the click handler. If true, toggle selection of the item without clearing others.
- **CTRL + A**: Add a global `keydown` listener (scoped to the file area) to select all items in the currently filtered list.

### 4. Background Uploads
- Modern browsers often throttle `setTimeout`, `setInterval`, and network requests in background tabs.
- **Approach**: We will investigate if using `AbortController` and `fetch` (which we already do) is sufficient if the browser doesn't actively kill the worker. To be robust, we might need a Service Worker or ensure we aren't relying on UI-thread-specific timings for chunk transitions.
- **Immediate Fix**: Ensure the upload loop in `HomePage.tsx` (specifically the resumable chunking) is robust against delays and continues as long as the process isn't killed.

## Risks / Trade-offs

- **Risk**: Double-click might feel slow on mobile.
    - **Mitigation**: We will ensure single-tap selection is primary on touch, or use standard mobile "tap to select, double tap to open" if it feels right, but long-press is more standard for starting multi-select.
