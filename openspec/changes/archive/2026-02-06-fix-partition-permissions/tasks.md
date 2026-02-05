## 1. Backend

- [x] 1.1 Update `routes/router.go` to use `filepath.Abs` for the partition manager root
- [x] 1.2 Update `system/partition/partition.go` to handle absolute base paths in `CreatePartition`
- [x] 1.3 Update `system/partition/partition.go` to handle absolute base paths in `GetPartitionPath`
- [x] 1.4 Verify tests in `routes/setup_test.go` still pass
