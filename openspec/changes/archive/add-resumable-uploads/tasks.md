# Tasks: Add Resumable Uploads

## Backend
- [ ] Research TUS protocol and choose implementation approach
- [ ] Add upload session table to database (track chunks, file metadata)
- [ ] Implement POST `/api/uploads` - create upload session
- [ ] Implement PATCH `/api/uploads/{id}` - upload chunk with offset
- [ ] Implement GET `/api/uploads/{id}` - get upload progress
- [ ] Implement DELETE `/api/uploads/{id}` - cancel/cleanup upload
- [ ] Add chunk storage mechanism (temp directory)
- [ ] Add chunk assembly on completion
- [ ] Add cleanup job for expired sessions (24h timeout)

## Frontend
- [ ] Install `tus-js-client` or implement custom chunking
- [ ] Create `ResumableUploadManager` component
- [ ] Add pause/resume buttons to upload UI
- [ ] Store upload state in localStorage
- [ ] Implement chunk-level progress tracking
- [ ] Add "Resume Uploads" section in UI
- [ ] Handle page refresh gracefully (restore state)
- [ ] Add retry logic for failed chunks
- [ ] Update existing upload flow to support resumable mode

## Testing
- [ ] Test upload pause and resume
- [ ] Test upload survival after page refresh
- [ ] Test network interruption recovery
- [ ] Test multiple simultaneous uploads
- [ ] Test cleanup of incomplete uploads
- [ ] Performance test with large files (1GB+)

## Documentation
- [ ] Update API documentation with upload endpoints
- [ ] Add user guide for resumable uploads
