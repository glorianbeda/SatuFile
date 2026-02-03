## Context

The current implementation treats any existing selection as a trigger for "multi-select mode," which causes subsequent single clicks to toggle items. This deviates from standard OS behavior where a single click typically resets the selection to the clicked item unless a modifier key (CTRL/Shift) is held.

## Goals / Non-Goals

**Goals:**
- Align file selection behavior with industry standards.
- Provide a clear distinction between single selection and multi-selection.
- Improve mobile UX for selecting multiple files.

**Non-Goals:**
- Implementing "Shift + Click" range selection (keep it simple for now, unless requested).
- Changing the visual style of the selection (keep the blue background).

## Decisions

- **Click Behavior (Desktop)**: 
    - Click: Selects only the clicked item (clears others).
    - CTRL + Click: Toggles the clicked item (keeps others).
- **Click Behavior (Mobile)**:
    - Long Press: Activates "Selection Mode" and selects the item.
    - Click (Normal): Navigates/Opens the item.
    - Click (Selection Mode Active): Toggles the item.
- **Selection Mode State**: 
    - Introduce a state/flag to track if we are in "Multi-select mode". 
    - Multi-select mode is automatically entered when `selectedFiles.length > 1` OR after a Long Press.
    - It is exited when selection is cleared.

## Risks / Trade-offs

- **[Risk]**: Users might find it harder to select multiple items on desktop if they don't know about the CTRL key.
    - **Mitigation**: Ensure that clicking the item's icon/checkbox (if added) always toggles, while clicking the row/background follows the refined logic.
