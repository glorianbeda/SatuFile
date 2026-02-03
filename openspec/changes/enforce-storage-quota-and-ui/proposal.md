## Why

The current storage implementation calculates usage but does not strictly enforce the logical quota (allocation) assigned to users during setup. Furthermore, the sidebar UI reflects the physical system disk usage rather than the user's specific logical quota and remaining balance. Users should be blocked from uploading if their logical quota is reached to maintain system integrity and multi-tenant isolation.

## What Changes

- **Backend Quota Enforcement**:
  - Update `UploadCreate` and `ResourcePost` handlers to check the user's `StorageAllocationGb` against current `CalculateStorageUsage`.
  - Block requests with a clear error message if the quota would be exceeded.
- **Frontend Sidebar Update**:
  - Update `StoragePanel.tsx` to display usage based on the user's specific `StorageAllocationGb`.
  - Show "used GB / total GB" relative to the user's logical partition.
- **Onboarding/Setup Continuity**:
  - Ensure the login flow remains mandatory at the start of setup.

## Capabilities

### Modified Capabilities
- `storage-management`: Enforce logical quotas for all upload and creation operations.
- `ui`: Update the storage panel to reflect user-specific logical quotas.

## Impact

- **Backend**:
  - `routes/api/uploads.go`: Add quota check in `UploadCreate`.
  - `routes/api/resources.go`: Add quota check in `ResourcePost`.
- **Frontend**:
  - `frontend/src/components/layout/StoragePanel.tsx`: Change data source for progress bar and labels.
