## Why

The current architecture tries to create OS-level partitions or directories at the root level, which is fragile, requires elevated privileges, and causes deployment issues (500 errors). The user wants an "easy setup and easy deploy" experience while maintaining the ability to limit user storage.

The "System Image" approach suggested by the user is complex to maintain. A containerized approach with application-level storage quotas is the modern best practice for this requirement.

## What Changes

- **Architecture Shift**: Move from "Partition Manager" to "Storage Quota Manager".
- **Deployment**: Add Docker support (`Dockerfile`, `docker-compose.yml`) for easy deployment.
- **Storage Logic**:
  - Deprecate/Rename `PartitionManager` to `StorageManager`.
  - Instead of creating physical paths based on mount points, just use a configurable data directory.
  - "Partitioning" becomes "Setting a Quota" in the database.
  - The "Drive Selection" step in setup becomes "Storage Confirmation" (or removed if auto-configured).

## Capabilities

### New Capabilities
- `containerization`: Docker support for easy deployment.

### Modified Capabilities
- `project-setup`: Shift from partition creation to quota initialization.
- `storage-management`: Enforce soft quotas based on database values instead of relying on filesystem partitions.

## Impact

- **Backend**:
  - Rename/Refactor `system/partition` -> `system/storage`.
  - Update setup routes to reflect this change.
- **Frontend**:
  - Update Setup Wizard to reflect "Initialize Storage" instead of "Create Partition".
- **Ops**:
  - Add Docker artifacts.
