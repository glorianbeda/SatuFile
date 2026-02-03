## MODIFIED Requirements

### Requirement: List Directory
The system SHALL list directory contents **and keep the list synchronized in real-time.**

#### Scenario: List files in directory
- **GIVEN** user requests GET /api/resources/{path}
- **WHEN** path is a directory
- **THEN** list of files and subdirectories is returned

#### Scenario: Get file info
- **GIVEN** user requests GET /api/resources/{path}
- **WHEN** path is a file
- **THEN** file metadata is returned

#### Scenario: Real-time update on CREATE
- **GIVEN** user is viewing a directory
- **WHEN** a WebSocket message with type `FS_EVENT` and op `CREATE` is received for that directory
- **THEN** the file list SHALL be automatically refreshed
