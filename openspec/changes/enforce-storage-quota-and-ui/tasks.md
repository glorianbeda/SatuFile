## 1. Backend

- [x] 1.1 Implement `CheckQuota` helper in `system/partition/storage_manager.go`
- [x] 1.2 Update `ResourcePost` in `routes/api/resources.go` to call `CheckQuota` before creating directories or saving files
- [x] 1.3 Update `UploadCreate` in `routes/api/uploads.go` to call `CheckQuota` before starting a session
- [x] 1.4 Update `UploadChunk` in `routes/api/uploads.go` to re-verify quota before final assembly

## 2. Frontend

- [x] 2.1 Update `frontend/src/components/layout/StoragePanel.tsx` to use user-specific usage and quota data from `AuthContext` or `/api/me`
- [x] 2.2 Add user-friendly "Storage Full" error messages to the upload logic
