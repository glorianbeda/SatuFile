## 1. Backend Fixes

- [x] 1.1 Update `routes/api/resources.go` to strictly require `StoragePath` and reject fallback to project root
- [x] 1.2 Update `routes/api/raw.go` to use `StoragePath` isolation
- [x] 1.3 Update `routes/api/storage.go` to use `StoragePath` isolation
- [x] 1.4 Update `routes/api/uploads.go` to use `StoragePath` isolation
- [x] 1.5 Verify path sanitization prevents any `..` escaping in all resource handlers

## 2. Validation

- [x] 2.1 Add test case to `routes/setup_test.go` to verify that a user without `StoragePath` cannot access project files
- [x] 2.2 Verify that a user WITH `StoragePath` only sees files within that path
