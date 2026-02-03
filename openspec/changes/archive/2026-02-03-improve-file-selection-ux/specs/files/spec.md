## MODIFIED Requirements

### Requirement: File Selection
The system SHALL support selecting files and folders in the file browser.

#### Scenario: Single Select
- **GIVEN** one or more items are currently selected
- **WHEN** user clicks on an unselected item without modifier keys (CTRL/Meta)
- **THEN** previous selections are cleared
- **AND** only the clicked item becomes selected

#### Scenario: Multi-Select with Modifier Key
- **GIVEN** an item is already selected
- **WHEN** user clicks on another item while holding the CTRL or Meta key
- **THEN** the clicked item is toggled (added to or removed from the current selection)
- **AND** other selected items remain selected

#### Scenario: Enter Selection Mode (Mobile/Long Press)
- **GIVEN** no items are selected
- **WHEN** user performs a long press on an item
- **THEN** the system enters "Multi-select Mode"
- **AND** the long-pressed item becomes selected
- **AND** haptic feedback is triggered (if supported)

#### Scenario: Toggle Select in Selection Mode
- **GIVEN** "Multi-select Mode" is active
- **WHEN** user clicks on any item (without modifier keys)
- **THEN** the clicked item is toggled in the selection
- **AND** "Multi-select Mode" remains active until selection is manually cleared

#### Scenario: Exit Selection Mode
- **GIVEN** "Multi-select Mode" is active
- **WHEN** user clears the selection (e.g., clicks on empty space or presses ESC)
- **THEN** all items are deselected
- **AND** "Multi-select Mode" is deactivated
