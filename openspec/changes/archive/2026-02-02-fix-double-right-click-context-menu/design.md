## Context

We have implemented a custom context menu for the file browser background. However, rapid double right-clicks (or right-clicks in certain states) can still bypass our custom handler and trigger the browser's native context menu. This is a common issue when `preventDefault` is not called consistently or if event propagation is not managed correctly during rapid events.

## Goals / Non-Goals

**Goals:**
- Ensure the native browser context menu is suppressed on the file browser area, even with rapid clicking.
- Maintain the functionality of our custom background context menu.
- Ensure the custom context menu works reliably (opens on first click, moves on second click, etc.).

**Non-Goals:**
- Disabling the context menu globally for the entire application (unless the user explicitly requests it, but the proposal scopes it to "fix double right click"). We focus on the file browser area.

## Decisions

### 1. Robust Event Handler
We will modify the `handleBgContextMenu` in `HomePage.tsx`.
- Instead of just setting state, we will ensure `e.preventDefault()` and `e.stopPropagation()` are the very first actions.
- We will verify that state updates do not unmount/remount the container in a way that loses the event listener (though unlikely with React).

### 2. Double-Click Handling
The "double right click" issue might be due to the menu being open. When the menu is open, it might be capturing the second click?
- If the custom menu is open (MUI Menu), it uses a Portal/Overlay. Right-clicking outside it (on the background) should close it and open it at the new location.
- If the click hits the *backdrop* of the open menu, MUI might be handling it. We need to check if MUI Menu's backdrop allows right-clicks to pass through or if it triggers the native menu.
- Decision: We will add a `onContextMenu` handler to the `Menu` component or its backdrop props if possible, or ensure the container handler catches it. Actually, when MUI Menu is open, there is a transparent backdrop. Right-clicking it might default to browser behavior. We need to prevent that.

## Risks / Trade-offs

- **Risk**: Blocking legitimate context menus (e.g. on inputs).
    - **Mitigation**: We are attaching this to the main file area box, not globally. Inputs inside dialogs should still work if they are in a Portal outside this box.

## Migration Plan
N/A
