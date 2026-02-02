## 1. Backend Implementation

- [x] 1.1 Modify `UploadChunk` in `routes/api/uploads.go` to validate that non-terminal chunks match `DefaultChunkSize` (5MB).
- [x] 1.2 Modify `UploadChunk` to validate that the last chunk is `<= DefaultChunkSize`.
- [x] 1.3 Add a check before final assembly to ensure `session.UploadedSize` exactly matches `session.TotalSize`.
- [x] 1.4 Ensure session state (`UploadedChunks`, `UploadedSize`) is only updated after successful validation and disk write.

## 2. Verification

- [ ] 2.1 Verify successful upload of a large file (>150MB).
- [ ] 2.2 Verify that uploading a truncated chunk returns a 400 error.
- [ ] 2.3 Verify that a mismatched total size prevents file assembly.