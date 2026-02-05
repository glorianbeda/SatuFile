# Project Cleanup Specification

## Purpose
This specification defines requirements for removing unused deployment artifacts and maintaining a clean project structure.

## Requirements

### Requirement: Unused Files Removal
The system SHALL remove all unused deployment-related files that are no longer needed.

#### Scenario: deploy.sh is removed
- **GIVEN** the project cleanup is executed
- **WHEN** checking for deploy.sh
- **THEN** deploy.sh SHALL NOT exist in the project root

#### Scenario: Docker files are removed
- **GIVEN** the project cleanup is executed
- **WHEN** checking for Docker-related files
- **THEN** Dockerfile SHALL NOT exist
- **AND** docker-compose.yml SHALL NOT exist
- **AND** .dockerignore SHALL NOT exist (if present)

#### Scenario: Docker directory is removed
- **GIVEN** the project cleanup is executed
- **WHEN** checking for docker directory
- **THEN** docker/ directory SHALL NOT exist

---

### Requirement: Cleanup Verification
The system SHALL verify that cleanup was successful.

#### Scenario: Cleanup report shows removed files
- **GIVEN** cleanup has been performed
- **WHEN** examining cleanup output
- **THEN** it SHALL list all files that were removed

#### Scenario: No deployment artifacts remain
- **GIVEN** cleanup has been performed
- **WHEN** searching for deployment artifacts
- **THEN** no deploy.sh, Docker, or related scripts SHALL remain

---

### Requirement: Project Structure Integrity
The system SHALL maintain project structure integrity after cleanup.

#### Scenario: Core application files remain
- **GIVEN** cleanup has been performed
- **WHEN** examining core application files
- **THEN** main.go SHALL exist (Go backend)
- **AND** frontend/ directory SHALL exist
- **AND** package.json SHALL exist

#### Scenario: Package.json scripts are updated
- **GIVEN** cleanup has been performed
- **WHEN** examining package.json
- **THEN** deployment-related scripts SHALL reference PM2 instead of Docker/deploy.sh
