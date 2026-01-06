## ADDED Requirements

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
