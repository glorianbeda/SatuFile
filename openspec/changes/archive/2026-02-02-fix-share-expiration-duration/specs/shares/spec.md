## MODIFIED Requirements

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
- **WHEN** user creates a share link with 1 hour expiration
- **THEN** a share token is generated
- **AND** the share expires in 1 hour (verifiable by API or link validity)
- **AND** a FolderShared icon appears next to the file in the file list

#### Scenario: Share file permanently

- **GIVEN** user is authenticated
- **AND** user has a file at `/Documents/report.pdf`
- **WHEN** user creates a permanent share link
- **THEN** a share token is generated
- **AND** the share never expires (or 100 years)
- **AND** a FolderShared icon appears next to the file in the file list
