# Capability: Files

## ADDED Requirements

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
