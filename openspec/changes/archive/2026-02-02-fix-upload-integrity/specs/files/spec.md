## ADDED Requirements

### Requirement: Resumable File Upload Integrity
The system SHALL strictly validate chunk sizes and total file size during resumable uploads to ensure data integrity.

#### Scenario: Validate Chunk Size
- **GIVEN** a resumable upload session is active with ChunkSize 5MB
- **WHEN** client uploads a chunk that is NOT the last chunk
- **AND** the chunk size is less than 5MB
- **THEN** the server returns 400 Bad Request
- **AND** the session is not updated

#### Scenario: Validate Final Assembly
- **GIVEN** all chunks have been uploaded
- **WHEN** the server attempts to assemble the file
- **AND** the sum of uploaded bytes does not equal the session TotalSize
- **THEN** the server returns 500 Internal Server Error (or appropriate error)
- **AND** the file is not assembled
- **AND** the session status remains "uploading"
