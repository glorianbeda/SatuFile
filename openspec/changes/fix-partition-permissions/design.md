## Context

The setup wizard currently tries to create user storage partitions based on the "drive" selected in the frontend. If a user selects `/` (root), the backend attempts to create storage at `/data/cloud-storage`. This often fails because the application process lacks write permissions to `/data`.

We need to restrict partition creation to a writable directory within the application's control, regardless of the selected drive.

**Current State:**
- Frontend sends `{ drive: "/", ... }`
- Backend tries `mkdir /data/cloud-storage` (fails)

**Constraints:**
- The application should be self-contained and not require root access.
- User storage should persist in a predictable location.

## Goals / Non-Goals

**Goals:**
- **Safe Partition Creation**: Ensure partitions are created in a writable path (e.g., `<project_root>/data/cloud-storage`).
- **Ignore Dangerous Inputs**: If the input drive is `/` or invalid, fall back to the safe application-relative path.
- **Maintain Testability**: Ensure unit tests still work by allowing configurable paths.

**Non-Goals:**
- Implementing actual disk partitioning or formatting (this is just directory creation).
- Supporting multiple physical disks for a single user instance (future scope).

## Decisions

### 1. Partition Path Configuration

**Decision:** Update `routes/router.go` to initialize `PartitionManager` with an absolute path joined with `data/cloud-storage`.

**Rationale:**
- This ensures that storage is always created within the project's directory structure (or wherever `root` points to).
- `filepath.Abs(root)` ensures consistent path resolution.

### 2. Update `CreatePartition` Logic

**Decision:** Modify `system/partition/partition.go` to handle absolute base paths.
- If `basePath` is absolute, ignore the `driveMount` parameter.
- This effectively "sanitizes" the input from the frontend, treating the "drive" selection as a logical choice rather than a physical mount point for directory creation purposes in this context.

**Rationale:**
- Prevents directory traversal or creation in unauthorized system locations.
- Decouples the logical "drive" concept from the physical file system path for simple deployments.

## Risks / Trade-offs

**Risk:** **User confusion?**
- *Concern:* User selects Drive X but storage is on Drive Y?
- *Mitigation:* For now, we are in a single-instance mode where "drives" are detected but we force storage to the app's data dir. This is acceptable for the MVP/current scope. In the future, true multi-drive support would require running the app with higher permissions or pre-configured mount points.

## Migration Plan

1.  **Code Changes**: Update backend logic (Router and PartitionManager).
2.  **Verify**: Run existing tests (`TestSetupFlow`) which verify partition creation.

## Open Questions

- None.
