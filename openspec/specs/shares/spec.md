# shares Specification

## Purpose
TBD - created by archiving change enhance-folder-sharing. Update Purpose after archive.
## Requirements
### Requirement: Public Share Page

The system SHALL provide a public page for accessing shared folders and files with read-only access.

#### Scenario: Access shared folder

- **GIVEN** user has a valid share token for a folder
- **WHEN** user opens the public share URL
- **THEN** the shared folder contents are displayed
- **AND** the view is similar to the main file management interface
- **AND** no authentication is required

#### Scenario: Browse shared folder structure

- **GIVEN** user is viewing a shared folder
- **WHEN** user clicks on a subfolder
- **THEN** the subfolder contents are displayed
- **AND** user can navigate back to parent folders

#### Scenario: Read-only access for shared folder

- **GIVEN** user is viewing a shared folder
- **WHEN** user attempts to modify files (rename, delete, upload)
- **THEN** no modification options are available
- **AND** only view and download actions are available

#### Scenario: Access shared file

- **GIVEN** user has a valid share token for a file
- **WHEN** user opens the public share URL
- **THEN** the file is displayed or downloaded
- **AND** no authentication is required

#### Scenario: Download file from shared folder

- **GIVEN** user is viewing a shared folder
- **WHEN** user clicks download on a file
- **THEN** the file is downloaded
- **AND** user remains on the shared page

#### Scenario: Preview file from shared folder

- **GIVEN** user is viewing a shared folder
- **AND** file is previewable (image, video, audio, PDF)
- **WHEN** user clicks preview on a file
- **THEN** the file is displayed in a preview modal
- **AND** user remains on the shared page

#### Scenario: Expired share link

- **GIVEN** user has an expired share token
- **WHEN** user opens the public share URL
- **THEN** an error message is displayed
- **AND** no content is shown

#### Scenario: Invalid share token

- **GIVEN** user has an invalid share token
- **WHEN** user opens the public share URL
- **THEN** an error message is displayed
- **AND** no content is shown

#### Scenario: Breadcrumb navigation in shared folder

- **GIVEN** user is viewing a shared folder at `/Documents/Projects/Active`
- **WHEN** the shared page is displayed
- **THEN** breadcrumb shows the folder path
- **AND** each segment is clickable to navigate up

#### Scenario: File list display in shared folder

- **GIVEN** user is viewing a shared folder
- **WHEN** the shared page is displayed
- **THEN** files and folders are listed in a table or grid
- **AND** each item shows name, size, and modified date
- **AND** icons indicate file types

#### Scenario: No modification UI in shared view

- **GIVEN** user is viewing a shared folder
- **WHEN** the shared page is displayed
- **THEN** no upload button is shown
- **AND** no create folder button is shown
- **AND** no edit/delete options are available in context menu
- **AND** only download and preview options are available

