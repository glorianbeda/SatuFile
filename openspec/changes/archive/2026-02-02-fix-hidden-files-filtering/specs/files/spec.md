## MODIFIED Requirements

### Requirement: List Directory

The system SHALL list directory contents.

#### Scenario: List files in directory
- **GIVEN** user requests GET /api/resources/{path}
- **WHEN** path is a directory
- **THEN** list of files and subdirectories is returned
- **AND** files starting with '.' ARE NOT returned by default (hidden)

#### Scenario: Show hidden files enabled
- **GIVEN** "Show Hidden Files" setting is ENABLED
- **WHEN** user lists a directory
- **THEN** all files, including those starting with '.', are displayed
