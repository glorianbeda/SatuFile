## Why

Large file uploads (typically >150MB) are failing silently. The server accepts partial chunks and blindly assembles them into a corrupt file, while still reporting a "completed" status to the client. This leads to data loss and user confusion, as the UI indicates a successful upload. We need to strictly enforce data integrity during the upload process.

## What Changes

- Add validation in `UploadChunk` to ensure the received chunk size matches the expected `ChunkSize` (except for the final chunk).
- Add a final validation step before assembly to ensure `UploadedSize` exactly matches the session's `TotalSize`.
- Ensure atomic or safe updates to session progress to prevent race conditions during chunk uploads.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `files`: Add strict integrity checks for file uploads.

## Impact

- **Backend**: `routes/api/uploads.go` will be modified to include validation logic.
- **Frontend**: No direct changes expected, but the UI will now correctly receive error responses if integrity checks fail, rather than a false success.
