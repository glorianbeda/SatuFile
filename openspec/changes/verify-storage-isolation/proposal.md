## Why

The user is reporting that they still see all project files and folders instead of their isolated storage folder. This indicates a failure in the logical root isolation logic. Specifically, even if `user.StoragePath` is set, the API might still be defaulting to the global root or incorrectly joining paths, allowing users to see the entire project structure.

## What Changes

- **Backend Resource Isolation**: Ensure that `user.StoragePath` is always used as the root for file operations if it exists.
- **Path Sanitization**: Verify that requested paths are always relative to the effective root and cannot escape via `..`.
- **User Record Consistency**: Ensure `StoragePath` is correctly persisted and loaded.
- **Admin Restriction**: Even admin users should be isolated to their own storage path for general file browsing unless they are using specific admin tools.

## Capabilities

### Modified Capabilities
- `storage-management`: Enforce strict logical root isolation for all file resources.

## Impact

- **Backend**:
  - `routes/api/resources.go`: Re-verify and strengthen isolation logic.
  - `files/file.go`: Ensure `ReadDir` and `NewFileInfo` correctly respect the provided root.
- **Middleware**:
  - `auth/middleware.go`: Ensure user object in context has all required fields for isolation.
