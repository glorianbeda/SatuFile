# Proposal: Add Resumable Uploads

## Problem
Users uploading large files can lose all progress if their connection drops or if they accidentally close the tab. This creates a frustrating experience and wastes bandwidth.

## Solution
Implement chunked resumable uploads using the TUS (Transloadit Upload Service) protocol, allowing users to pause and resume file uploads. The implementation will:

1. Split large files into chunks on the client side
2. Upload chunks sequentially with progress tracking
3. Store upload state in browser storage
4. Allow pausing/resuming from where the upload left off
5. Handle network interruptions gracefully

## Scope
- **Frontend**: Chunked upload UI with pause/resume controls
- **Backend**: TUS-compatible upload endpoint with chunk storage
- **Database**: Upload session tracking

## Benefits
- Better UX for large file uploads
- Reduced bandwidth waste on failed uploads
- Explicit user control over upload process

## Implementation Notes
- Use `tus-js-client` on frontend
- Consider using Go's `github.com/tus/tusd` package or custom implementation
- Display chunk-level progress (e.g., "Chunk 3/10")
