## ADDED Requirements

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
