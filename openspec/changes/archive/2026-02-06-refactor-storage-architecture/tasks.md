## 1. Backend Refactor

- [x] 1.1 Rename `PartitionManager` to `StorageManager` in `system/partition/partition.go` (and rename file to `storage_manager.go`)
- [x] 1.2 Update `StorageManager` to only create logical directories, removing any OS-partition specific language
- [x] 1.3 Update `routes/api/setup.partition.post.go` to use `StorageManager` and enforce DB-based quota limits
- [x] 1.4 Update `routes/router.go` to initialize `StorageManager`
- [x] 1.5 Deprecate `system/detection` usage for setup if it's no longer needed for physical drive selection (or simplify it to just show available disk space of the root volume)

## 2. PM2 Support

- [x] 2.1 Create `ecosystem.config.js` for PM2 deployment
- [x] 2.2 Create `build.sh` to build the binary and frontend for PM2 execution

## 3. Frontend Updates

- [x] 3.1 Rename "Partition" step to "Storage" step in Setup Wizard UI
- [x] 3.2 Update API calls to reflect new logical storage approach (if endpoints changed, otherwise just text/UI updates)
- [x] 3.3 Ensure the "Drive Selection" step is either removed or just shows "System Storage" with available space
