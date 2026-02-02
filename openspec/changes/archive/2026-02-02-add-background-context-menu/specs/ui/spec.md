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

### Requirement: Upload File

The system SHALL allow authenticated users to upload files to their storage.

#### Scenario: Upload single file

- **GIVEN** user is authenticated with create permission
- **WHEN** POST request to /api/resources/{path} with file body
- **THEN** file is saved at the specified path
- **AND** response includes file info (name, size, modified)

#### Scenario: Upload to non-existent directory

- **GIVEN** target directory does not exist
- **WHEN** user uploads file
- **THEN** parent directories are created automatically

#### Scenario: File already exists - no override

- **GIVEN** file exists at target path
- **WHEN** user uploads without override flag
- **THEN** 409 Conflict is returned

#### Scenario: File already exists - with override

- **GIVEN** file exists at target path
- **WHEN** user uploads with ?override=true
- **THEN** file is overwritten

#### Scenario: Upload from Background Context Menu
- **GIVEN** user right-clicks on the file browser background area
- **WHEN** the "Upload File" option is selected
- **THEN** the file selection dialog opens
- **AND** selected files are uploaded to the current directory
