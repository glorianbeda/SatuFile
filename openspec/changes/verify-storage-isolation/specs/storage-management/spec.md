## MODIFIED Requirements

### Requirement: User Logical Root Enforcement
The system SHALL strictly isolate file operations to the user's assigned `StoragePath`.

#### Scenario: Access storage root
- **WHEN** user is authenticated
- **AND** user has a valid `StoragePath` assigned
- **AND** user requests `/` path
- **THEN** system SHALL list contents of `user.StoragePath`
- **AND** system MUST NOT include any files from the application project root

#### Scenario: Prevent path escape
- **WHEN** user requests a path containing `..` or attempts to access parent directories
- **THEN** system MUST reject the request or sanitize the path to stay within `user.StoragePath`

#### Scenario: Handle missing StoragePath
- **WHEN** user has no `StoragePath` assigned (and setup is finished)
- **AND** user attempts to access file resources
- **THEN** system SHALL return a `403 Forbidden` error with a clear message indicating storage is not configured
