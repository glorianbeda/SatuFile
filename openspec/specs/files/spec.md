# files Specification

## Purpose
This specification defines the requirements for file management operations, including uploading, downloading, renaming, sharing, and a refined file selection UX for desktop and mobile.
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

---

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

---

### Requirement: Share Folder

The system SHALL allow users to share folders with all their contents recursively.

#### Scenario: Share folder with default expiration

- **GIVEN** user is authenticated
- **AND** user has a folder at `/Documents/Projects`
- **WHEN** user creates a share link for the folder
- **THEN** a share token is generated
- **AND** the share includes all files and subfolders in `/Documents/Projects`
- **AND** the share expires in 24 hours by default

#### Scenario: Share folder with custom expiration

- **GIVEN** user is authenticated
- **AND** user has a folder at `/Documents/Projects`
- **WHEN** user creates a share link with 7 days expiration
- **THEN** a share token is generated
- **AND** the share expires in 7 days

#### Scenario: Share folder permanently

- **GIVEN** user is authenticated
- **AND** user has a folder at `/Documents/Projects`
- **WHEN** user creates a permanent share link
- **THEN** a share token is generated
- **AND** the share never expires (100 years)

---

### Requirement: Visual Shared Indicator

The system SHALL display a FolderShared icon next to shared folders and files in the file list.

#### Scenario: Display shared icon for shared folder

- **GIVEN** user has a shared folder at `/Documents/Projects`
- **WHEN** user views the file list
- **THEN** a FolderShared icon appears after the modified date for that folder

#### Scenario: Display shared icon for shared file

- **GIVEN** user has a shared file at `/Documents/report.pdf`
- **WHEN** user views the file list
- **THEN** a FolderShared icon appears after the modified date for that file

#### Scenario: No shared icon for unshared items

- **GIVEN** user has an unshared folder at `/Documents/Private`
- **WHEN** user views the file list
- **THEN** no FolderShared icon appears for that folder

---

### Requirement: Share Folder from UI

The system SHALL provide a UI option to share folders.

#### Scenario: Share option in folder context menu

- **GIVEN** user right-clicks on a folder in the file list
- **WHEN** context menu opens
- **THEN** "Share" option is available in the menu

#### Scenario: Share dialog for folder

- **GIVEN** user clicks "Share" on a folder
- **WHEN** share dialog opens
- **THEN** dialog shows folder name
- **AND** user can select expiration duration
- **AND** user can create share link

---

### Requirement: Share File

The system SHALL allow users to share files with configurable expiration times.

#### Scenario: Share file with default expiration

- **GIVEN** user is authenticated
- **AND** user has a file at `/Documents/report.pdf`
- **WHEN** user creates a share link for the file
- **THEN** a share token is generated
- **AND** the share expires in 24 hours by default
- **AND** a FolderShared icon appears next to the file in the file list

#### Scenario: Share file with custom expiration

- **GIVEN** user is authenticated
- **AND** user has a file at `/Documents/report.pdf`
- **WHEN** user creates a share link with 7 days expiration
- **THEN** a share token is generated
- **AND** the share expires in 7 days
- **AND** a FolderShared icon appears next to the file in the file list

#### Scenario: Share file permanently

- **GIVEN** user is authenticated
- **AND** user has a file at `/Documents/report.pdf`
- **WHEN** user creates a permanent share link
- **THEN** a share token is generated
- **AND** the share never expires (100 years)
- **AND** a FolderShared icon appears next to the file in the file list

#### Scenario: Share file via context menu

- **GIVEN** user right-clicks on a file in the file list
- **WHEN** context menu opens
- **THEN** "Share" option is available in the menu

#### Scenario: Share dialog for file

- **GIVEN** user clicks "Share" on a file
- **WHEN** share dialog opens
- **THEN** dialog shows file name
- **AND** user can select expiration duration
- **AND** user can create share link

#### Scenario: Copy share link to clipboard

- **GIVEN** share link is created
- **WHEN** user clicks the copy button
- **THEN** share link is copied to clipboard
- **AND** success message is displayed

#### Scenario: Share link expiration options

- **GIVEN** user opens share dialog
- **WHEN** user views expiration options
- **THEN** options include: 1 hour, 24 hours, 7 days, 30 days, permanent

