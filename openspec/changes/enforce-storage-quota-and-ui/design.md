## Context

The system recently shifted from physical OS partitions to a logical storage architecture. While storage paths are isolated, the quotas (allocation sizes) set during setup are not yet enforced during file uploads or directory creation. Additionally, the sidebar UI currently shows the entire system disk usage, which is misleading for a per-user logical quota model.

## Goals / Non-Goals

**Goals:**
- Enforce user-specific logical quotas on all write operations.
- Update UI to show "Usage / Quota" relative to the user's allocated space.
- Block uploads that would exceed the quota.

**Non-Goals:**
- Real-time hard quota enforcement via the OS (e.g., ext4 quotas). We will use application-level "soft" enforcement.

## Decisions

### 1. Quota Check Logic

**Decision:** Implement a helper function in `system/partition` (or `system/storage`) that checks if adding X bytes to a user's storage will exceed their `StorageAllocationGb`.

**Rationale:**
- Centralizing this logic ensures consistency across `UploadCreate`, `ResourcePost`, and future write endpoints.
- Quota is stored in `User` model, usage is calculated recursively via `CalculateStorageUsage`.

### 2. Frontend UI Update

**Decision:** Update `StoragePanel.tsx` to use the `storage_used_gb` and `storage_allocation_gb` fields from the `/api/me` response (via `MeResponse`).

**Rationale:**
- These fields already exist in `MeResponse` but the UI was likely using the global system stats from `/api/storage`.

### 3. Error Handling

**Decision:** Return a 413 Payload Too Large or 403 Forbidden with a specific error code (`quota_exceeded`) when writes are blocked.

**Rationale:**
- Allows the frontend to show a specific "Storage Full" warning.

## Risks / Trade-offs

- **Risk**: Performance of `CalculateStorageUsage` on large directories.
- **Mitigation**: Cache the usage value or only recalculate on write operations. For MVP, we will recalculate on write.

## Migration Plan

1. Backend: Update handlers.
2. Frontend: Update UI component.
