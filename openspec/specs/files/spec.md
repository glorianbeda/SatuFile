# files Specification

## Purpose
TBD - created by archiving change add-file-upload-handler. Update Purpose after archive.
## Requirements
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

---

### Requirement: Create Directory

The system SHALL allow users to create directories.

#### Scenario: Create directory

- **GIVEN** user is authenticated with create permission
- **WHEN** POST request to /api/resources/{path}/
- **THEN** directory is created
- **AND** 201 Created is returned

---

### Requirement: List Directory

The system SHALL list directory contents.

#### Scenario: List files in directory

- **GIVEN** user requests GET /api/resources/{path}
- **WHEN** path is a directory
- **THEN** list of files and subdirectories is returned

#### Scenario: Get file info

- **GIVEN** user requests GET /api/resources/{path}
- **WHEN** path is a file
- **THEN** file metadata is returned

### Requirement: Navigation Breadcrumb
The system SHALL display a breadcrumb showing the current directory path.

#### Scenario: View Breadcrumb
- **GIVEN** user is in directory `/Documents/Projects`
- **WHEN** the file browser is displayed
- **THEN** breadcrumb shows "Home > Documents > Projects"
- **AND** each segment is clickable to navigate

---

### Requirement: Back Button Navigation
The system SHALL provide a back button to navigate to the parent directory.

#### Scenario: Navigate Back
- **GIVEN** user is in directory `/Documents/Projects`
- **WHEN** user clicks the back button
- **THEN** user navigates to `/Documents`

#### Scenario: Back Button Disabled at Root
- **GIVEN** user is at root directory `/`
- **WHEN** the file browser is displayed
- **THEN** back button is disabled or hidden

---

### Requirement: Protected Core Folders
The system SHALL prevent deletion of core folders.

#### Scenario: Delete Core Folder Rejected
- **GIVEN** user attempts to delete `/Documents`
- **WHEN** DELETE request is sent
- **THEN** system returns 403 Forbidden
- **AND** error message "Cannot delete protected folder"

#### Scenario: Delete Files Inside Core Folder Allowed
- **GIVEN** user attempts to delete `/Documents/myfile.txt`
- **WHEN** DELETE request is sent
- **THEN** file is deleted successfully

---

### Requirement: Auto-Create Core Folders
The system SHALL create core folders on startup if they don't exist.

#### Scenario: First Run
- **GIVEN** data directory is empty
- **WHEN** server starts
- **THEN** Documents, Pictures, Videos, Audio, Downloads folders are created

### Requirement: File Download

The system SHALL provide file download functionality via direct file download.

#### Scenario: Direct Download from Context Menu

- **GIVEN** user clicks Download in context menu
- **WHEN** download action is triggered
- **THEN** file is downloaded directly (not opened in new tab)
- **AND** browser download prompt appears
- **AND** file is saved with original filename

#### Scenario: Direct Download from Preview Modal

- **GIVEN** user clicks Download button in preview modal
- **WHEN** download button is clicked
- **THEN** file is downloaded directly
- **AND** modal remains open

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

The system SHALL display file previews in a modal for supported media types only.

#### Scenario: Preview Image

- **GIVEN** user clicks on an image file (jpg, jpeg, png, gif, webp, svg, bmp)
- **WHEN** preview modal opens
- **THEN** image is displayed in modal

#### Scenario: Preview PDF

- **GIVEN** user clicks on a PDF file
- **WHEN** preview modal opens
- **THEN** PDF is embedded and viewable

#### Scenario: Preview Audio/Video

- **GIVEN** user clicks on audio/video file
  - **AND** extension is mp4, webm, avi, mov, mkv (video)
  - **OR** extension is mp3, wav, ogg, m4a, flac (audio)
- **WHEN** preview modal opens
- **THEN** HTML5 player is shown

#### Scenario: No Preview for Text Files

- **GIVEN** user clicks on text file (txt, md, log, csv)
- **WHEN** file is clicked
- **THEN** preview modal does NOT open
- **AND** no preview option appears in context menu

#### Scenario: No Preview for Code Files

- **GIVEN** user clicks on code file (js, ts, jsx, tsx, html, css, go, py, sh)
- **WHEN** file is clicked
- **THEN** preview modal does NOT open
- **AND** no preview option appears in context menu

#### Scenario: No Preview for Config Files

- **GIVEN** user clicks on config file (json, yaml, xml, yml)
- **WHEN** file is clicked
- **THEN** preview modal does NOT open
- **AND** no preview option appears in context menu

#### Scenario: Context Menu Shows Only Download for Non-Previewable

- **GIVEN** user opens context menu on non-previewable file
- **WHEN** menu opens
- **THEN** only Download, Rename, Delete options are shown
- **AND** Preview option is NOT shown

#### Scenario: Context Menu Shows Preview for Previewable

- **GIVEN** user opens context menu on previewable file (image, video, audio, pdf)
- **WHEN** menu opens
- **THEN** Preview, Download, Rename, Delete options are shown
- **AND** Preview option appears first

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

