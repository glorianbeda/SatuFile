## ADDED Requirements

### Requirement: Resumable Upload

The system SHALL support chunked uploads with pause/resume capability for large files.

#### Scenario: Upload large file with chunking

- **GIVEN** user selects a file larger than 10MB
- **WHEN** user initiates upload
- **THEN** file is split into chunks (5MB each)
- **AND** chunks are uploaded sequentially
- **AND** progress shows chunk-level detail (e.g., "Chunk 3/10 - 30%")

#### Scenario: Pause upload

- **GIVEN** user has an upload in progress
- **WHEN** user clicks "Pause" button
- **THEN** current chunk completes
- **AND** upload state is saved to browser storage
- **AND** upload pauses
- **AND** "Resume" button becomes available

#### Scenario: Resume upload after pause

- **GIVEN** user paused an upload
- **WHEN** user clicks "Resume" button
- **THEN** upload continues from the next unsent chunk
- **AND** previously uploaded chunks are not re-sent
- **AND** progress updates correctly

#### Scenario: Resume upload after page refresh

- **GIVEN** user was uploading a file
- **AND** browser is closed or refreshed
- **WHEN** user returns to the upload page
- **THEN** system shows list of incomplete uploads
- **AND** user can click "Resume" to continue
- **AND** upload continues from last completed chunk

#### Scenario: Upload fails mid-chunk

- **GIVEN** user is uploading a file
- **AND** network connection drops during chunk upload
- **WHEN** connection is restored
- **THEN** system automatically retries the failed chunk
- **AND** upload continues after successful retry
- **AND** user is notified of the network error and recovery

#### Scenario: Remove incomplete upload

- **GIVEN** user has incomplete uploads
- **WHEN** user clicks "Remove" on an incomplete upload
- **THEN** upload state is cleared from storage
- **AND** uploaded chunks are cleaned up on server
- **AND** upload is removed from incomplete list

#### Scenario: Multiple simultaneous resumable uploads

- **GIVEN** user has multiple files queued
- **WHEN** user uploads files simultaneously
- **THEN** each file uploads in chunks independently
- **AND** pause/resume works independently for each file
- **AND** overall progress shows all active uploads

---
