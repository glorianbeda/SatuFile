## Why

The current partition creation implementation attempts to create partitions at the system root path (e.g., `/data`) if the user selects the root drive `/`. This fails with "permission denied" because the application does not (and should not) have root privileges.

We need to ensure that user storage is always created within the application's configured root directory or a specific writable data directory, regardless of the "drive" selected in the setup wizard.

## What Changes

- **Backend Logic**: Update `PartitionManager` to accept and use a configured `partitionPath` which is relative to the application's root (e.g., `<project_root>/data/cloud-storage`).
- **Configuration**: Update route registration to initialize `PartitionManager` with the correct absolute path.
- **Drive Handling**: Ensure that even if a user selects a specific drive (like `/` or `/mnt/drive1`), the partition creation logic either maps this to a safe path or ignores the mount point if it's not relevant to the single-user/single-storage model we currently support.

## Capabilities

### Modified Capabilities
- `project-setup`: Update partition creation logic to be safe and permission-aware.

## Impact

- **Backend**:
  - `system/partition/partition.go`: Modify `CreatePartition` to handle absolute base paths correctly.
  - `routes/router.go`: Inject the correct, writable partition path.
- **Tests**:
  - `routes/setup_test.go`: Ensure tests pass with the new logic.
