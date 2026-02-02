## MODIFIED Requirements

### Requirement: Create Folder via UI

The system SHALL provide a UI to create new folders.

#### Scenario: Create Folder Dialog

- **GIVEN** user clicks Create > New Folder
- **WHEN** user enters folder name and submits
- **THEN** POST /api/resources/{path}/ is called
- **AND** new folder appears in file list

#### Scenario: Create Folder from Background Context Menu
- **GIVEN** user right-clicks on the file browser background area
- **WHEN** the "New Folder" option is selected from the context menu
- **THEN** the Create Folder Dialog opens
- **AND** submitting creates the folder in the current directory

---

### Requirement: Context Menu Suppression

The system SHALL suppress the native browser context menu in the file browser area.

#### Scenario: Single Right-Click Suppression
- **GIVEN** user is on the file browser page
- **WHEN** user right-clicks on the file area (background or item)
- **THEN** the application's custom context menu appears
- **AND** the browser's native context menu DOES NOT appear

#### Scenario: Double/Rapid Right-Click Suppression
- **GIVEN** user is on the file browser page
- **WHEN** user rapidly right-clicks twice (double right-click) on the file area
- **THEN** the application's custom context menu remains consistent (re-opens or stays open)
- **AND** the browser's native context menu DOES NOT appear at any point
