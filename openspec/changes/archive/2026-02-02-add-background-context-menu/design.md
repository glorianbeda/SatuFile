## Context

The current `FileContextMenu` component is designed to operate on a specific file item. It expects a `file` prop and renders options like "Download", "Rename", etc. We need a new context menu that appears when clicking on the empty background area of the file list/grid. This "Background Context Menu" should offer folder-level actions.

## Goals / Non-Goals

**Goals:**
- Provide a context menu for the file browser background.
- Support "New Folder", "Upload File", and "Refresh" actions.
- Ensure the menu appears at the cursor position.
- maintain consistent styling with the existing context menu.

**Non-Goals:**
- modifying the existing `FileContextMenu` to handle both cases (separation of concerns is preferred).
- Adding new complex actions beyond the standard set.

## Decisions

### 1. Separate Component: `BackgroundContextMenu`
We will create a new component `BackgroundContextMenu.tsx` instead of overloading `FileContextMenu`.
- **Rationale**: The props are different. `FileContextMenu` needs a `file` object. `BackgroundContextMenu` only needs the current path and callbacks for actions. This keeps components focused and type-safe.

### 2. Event Handling in `FileList` and `FileGrid`
We will attach `onContextMenu` listeners to the container elements in `FileList.tsx` and `FileGrid.tsx`.
- **Rationale**: These are the main views where the background interaction happens. We need to prevent the browser's default context menu and trigger our custom one.
- **Handling Propagation**: We must ensure that `stopPropagation()` is called on the *item* context menu events so that clicking a file doesn't *also* trigger the background menu.

### 3. Shared State
We will likely need to lift the state for the background menu (open/close, coordinates) to the parent `Files.tsx` component, similar to how the file context menu is handled, or manage it within the list/grid components if they are self-contained enough. Given the shared nature, `Files.tsx` (or the common layout) is a good place for the state if the menu is shared.

## Risks / Trade-offs

- **Risk**: Overlapping click zones.
    - **Mitigation**: Strict `stopPropagation` on file items.
- **Risk**: Mobile responsiveness.
    - **Mitigation**: Context menus are primarily a desktop paradigm. Mobile usually uses long-press or a separate action button (FAB). We will ensure it doesn't break mobile interactions, though it might only be accessible via touch hold if supported by the browser event.

## Migration Plan
N/A - New feature.
