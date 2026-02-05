## ADDED Requirements

### Requirement: Application Containerization
The application SHALL be deployable as a Docker container.

#### Scenario: Build Docker image
- **WHEN** `docker build` is run
- **THEN** a runnable container image containing the backend and frontend assets is created

#### Scenario: Run with Docker Compose
- **WHEN** `docker-compose up` is run
- **THEN** the application starts and is accessible on port 8080
- **AND** data is persisted to a volume

### Requirement: Logical Storage Management
The system SHALL manage user storage quotas logically without relying on OS-level partitions.

#### Scenario: Initialize User Storage
- **WHEN** a user completes the setup wizard
- **THEN** a directory is created for them in the configured data root
- **AND** their storage quota is saved to the database

#### Scenario: Enforce Storage Quota
- **WHEN** a user uploads a file
- **THEN** the system checks if the upload would exceed their allocated quota
- **AND** rejects the upload if it does

## MODIFIED Requirements

### Requirement: Setup Wizard - Storage Step
FROM: "Drive Selection" and "Partition Creation"
TO: "Storage Initialization"

#### Scenario: Initialize Storage
- **WHEN** user reaches the storage step
- **THEN** they can confirm the storage allocation (defaulting to a sensible limit or system max)
- **AND** clicking "Next" initializes their logical storage space
