## Context

Users are still reporting visibility of project-level files and folders. This indicates that the `ResourceGet` handler is not correctly isolating the file system scope to the user's `StoragePath`. 

**Current Implementation in `ResourceGet`:**
```go
		effectiveRoot := root
		if user.StoragePath != "" {
			effectiveRoot = user.StoragePath
		}
```
If `user.StoragePath` is somehow empty, it falls back to `root`, which is the project root directory.

**Constraints:**
- Every user MUST have a `StoragePath` assigned after setup.
- The system must NEVER fall back to the project root for non-setup related file operations.

## Goals / Non-Goals

**Goals:**
- **Strict Isolation**: Block any access to the project root.
- **Root Enforcement**: If `user.StoragePath` is empty and setup is complete, return an error rather than falling back.
- **Path Sanitization**: Ensure no `..` or absolute paths can escape the `StoragePath`.

## Decisions

### 1. Mandatory `StoragePath` for Resources

**Decision:** Modify `ResourceGet` and other resource handlers to REQUIRE a non-empty `user.StoragePath`.
- If `user.StoragePath` is empty, return 403 Forbidden or 500 Internal Error (indicating misconfiguration).
- The only exception is setup-related routes (which shouldn't be using `ResourceGet` anyway).

### 2. Path Cleanup

**Decision:** Always clean the requested path and join it strictly with the `StoragePath`.

## Risks / Trade-offs

- **Risk**: Existing users with empty `StoragePath` will lose access.
- **Mitigation**: Admin must ensure all users have completed setup or manually assign a storage path.

## Open Questions

- Why is `user.StoragePath` empty for the reporting user? 
  - *Hypothesis*: The user was created before the mandatory setup/storage logic was added.
