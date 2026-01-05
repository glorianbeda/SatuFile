## ADDED Requirements

### Requirement: File Download

The system SHALL provide file download functionality via raw file streaming.

#### Scenario: Download File

- **GIVEN** user requests GET /api/raw/{path}
- **WHEN** path points to a valid file
- **THEN** file content is streamed with appropriate Content-Type
- **AND** Content-Disposition header is set for download

---

### Requirement: File Rename

The system SHALL allow renaming files and folders.

#### Scenario: Rename File

- **GIVEN** user sends PATCH /api/resources/{path} with new name
- **WHEN** path is valid and new name is available
- **THEN** file is renamed successfully
- **AND** 200 OK with updated file info is returned

---

### Requirement: Create Folder via UI

The system SHALL provide a UI to create new folders.

#### Scenario: Create Folder Dialog

- **GIVEN** user clicks Create > New Folder
- **WHEN** user enters folder name and submits
- **THEN** POST /api/resources/{path}/ is called
- **AND** new folder appears in file list

---

### Requirement: File Preview Modal

The system SHALL display file previews in a modal.

#### Scenario: Preview Image

- **GIVEN** user clicks on an image file
- **WHEN** preview modal opens
- **THEN** image is displayed in modal

#### Scenario: Preview PDF

- **GIVEN** user clicks on a PDF file
- **WHEN** preview modal opens
- **THEN** PDF is embedded and viewable

#### Scenario: Preview Audio/Video

- **GIVEN** user clicks on audio/video file
- **WHEN** preview modal opens
- **THEN** HTML5 player is shown

---

### Requirement: Grid Context Menu

The system SHALL show a context menu on grid items.

#### Scenario: Open Context Menu

- **GIVEN** user clicks 3-dot menu on a file in grid view
- **WHEN** menu opens
- **THEN** options Download, Rename, Delete are shown

---

### Requirement: Real Storage Usage

The system SHALL display actual storage usage from the root directory.

#### Scenario: Get Storage Stats

- **GIVEN** user views storage panel
- **WHEN** GET /api/storage is called
- **THEN** total used bytes and per-folder breakdown is returned
