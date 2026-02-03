## MODIFIED Requirements

### Requirement: User Logical Root Enforcement
The system SHALL strictly isolate file operations to the user's assigned `StoragePath`.

#### Scenario: Enforce storage quota
- **WHEN** user attempts to upload a file or create a directory
- **AND** the resulting total usage would exceed `user.StorageAllocationGb`
- **THEN** system SHALL reject the operation with an error
- **AND** system MUST NOT save the file or create the directory

### Requirement: Storage Usage UI
The system SHALL display the user's current storage usage and quota.

#### Scenario: Display sidebar stats
- **WHEN** user views the main interface
- **THEN** the sidebar SHALL show "Used GB / Allocated GB"
- **AND** the progress bar SHALL reflect the percentage of the logical quota used
