## MODIFIED Requirements

### Requirement: Background File Upload

The system SHALL ensure that file uploads continue processing even when the application tab is not in active focus.

#### Scenario: Upload while tab is in background
- **GIVEN** a file upload is in progress
- **WHEN** the user switches to another browser tab or minimizes the browser
- **THEN** the upload process MUST NOT be paused or terminated by the client-side logic
- **AND** the progress continues to update when the user returns to the tab
