## Context

The current upload implementation in `routes/api/uploads.go` is vulnerable to data corruption. It trusts the input stream and updates the `UploadedSize` based on bytes written, without verifying if the received chunk matches the expected size. If a network interruption causes a chunk to be truncated, the server blindly accepts it. When `UploadedChunks` reaches `TotalChunks`, the file is assembled from these partial/corrupt chunks, and the upload is marked as successful.

## Goals / Non-Goals

**Goals:**
- Prevent corrupt files from being marked as completed.
- Fail or reject chunk uploads if the received size does not match the expected `ChunkSize`.
- Ensure the assembled file size exactly matches the declared `TotalSize`.

**Non-Goals:**
- Implementing cryptographic checksums (MD5/SHA) for chunks (out of scope for now).
- Changing the client-side chunking strategy.

## Decisions

### 1. Enforce Chunk Size Validation
We will modify `UploadChunk` to strictly validate the size of the received data.
- **Rule**: For `chunkIndex < TotalChunks - 1`, the received size MUST equal `session.ChunkSize`.
- **Rule**: For the last chunk (`chunkIndex == TotalChunks - 1`), the received size MUST be `<= session.ChunkSize`.
- **Rationale**: This is the most direct way to detect truncated uploads without overhead.

### 2. Final Size Verification
Before assembling the final file, we will assert that the sum of all uploaded bytes (`UploadedSize`) exactly equals the session's `TotalSize`.
- **Rationale**: This acts as a final safety net against any accounting errors or race conditions.

### 3. Safe State Updates
We will ensure that `UploadedChunks` and `UploadedSize` are only updated in the database after the chunk has been successfully written to disk and validated.

## Risks / Trade-offs

- **Risk**: If the client sends a variable-sized chunking scheme (which it currently doesn't), this validation will fail.
    - **Mitigation**: The frontend is confirmed to use a fixed 5MB chunk size.
