## MODIFIED Requirements

### Requirement: Visual Shared Indicator

The system SHALL display a shared indicator for files and folders that are shared.

#### Scenario: Shared Indicator Position and Style
- **GIVEN** a file or folder is shared
- **WHEN** the item is displayed in the file browser (List or Grid view)
- **THEN** a circular shared icon (badge style) appears at the bottom-left of the main file/folder icon
- **AND** it is visually prominent (e.g., colored background)

---

### Requirement: File and Folder Interaction

The system SHALL support standard interaction patterns for selecting and opening items.

#### Scenario: Single Click Selection
- **GIVEN** a file or folder is displayed
- **WHEN** the user performs a single left-click on the item
- **THEN** the item is selected (toggles selection state)
- **AND** the item DOES NOT open

#### Scenario: Double Click Opening
- **GIVEN** a file or folder is displayed
- **WHEN** the user performs a double left-click on the item
- **THEN** the item opens (navigates to folder or opens preview/download for file)

#### Scenario: Multi-Selection with Keyboard
- **GIVEN** the file browser is focused
- **WHEN** the user holds the CTRL key and performs a single click on multiple items
- **THEN** all clicked items are added to the selection
- **WHEN** the user presses CTRL + A
- **THEN** all items in the current view are selected

#### Scenario: Multi-Selection with Touch
- **GIVEN** the user is using a touch device
- **WHEN** the user performs a long press (hold) on an item
- **THEN** the item is selected
- **AND** multi-selection mode is activated, allowing further selection by single taps

#### Scenario: Selection Actions UI
- **GIVEN** one or more items are selected
- **WHEN** the selection state changes
- **THEN** "Select All" and "Unselect All" options appear in the toolbar or context menu
