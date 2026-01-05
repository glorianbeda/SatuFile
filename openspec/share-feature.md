# Share Feature Implementation

## Overview
This change proposal implements a file sharing feature that allows users to generate shareable links for files and folders, similar to the functionality in filebrowser.

## Goals
- Add "Share" option to file context menu
- Generate secure shareable links with expiration dates
- Support both file and folder sharing
- Provide share dialog with configuration options
- Implement share management and revocation

## Technical Implementation

### Backend Changes
1. **Share API Endpoints**:
   - `POST /api/share` - Create new share link
   - `GET /api/share/:id` - Get share details
   - `DELETE /api/share/:id` - Revoke share
   - `GET /api/share/public/:token` - Public access endpoint

2. **Share Storage**:
   - Create `share/share.go` with Link struct
   - Implement storage backend for share links
   - Add share metadata (token, expiration, permissions)

3. **File Access Logic**:
   - Modify file access handlers to support public access
   - Add token validation middleware
   - Implement download and preview for shared files

### Frontend Changes
1. **Share Dialog**:
   - Create `ShareDialog.tsx` component
   - Include share configuration options:
     - Expiration date
     - Download permissions
     - Preview permissions

2. **Context Menu Integration**:
   - Add "Share" option to `FileContextMenu.tsx`
   - Handle share creation and management

3. **Share Management**:
   - Add share list to user interface
   - Implement share revocation

## Security Considerations
- Generate secure random tokens
- Set reasonable expiration defaults
- Validate share permissions
- Rate limit public access endpoints

## User Experience
- Simple share creation workflow
- Clear share status indicators
- Easy share revocation
- Copy-to-clipboard functionality

## Implementation Plan
1. Create share API endpoints
2. Implement share storage logic
3. Add share dialog component
4. Integrate with context menu
5. Add share management UI
6. Testing and validation

## Dependencies
- None (built on existing file access infrastructure)

## Timeline
- Backend implementation: 2-3 days
- Frontend implementation: 2-3 days
- Testing: 1-2 days
- Total: ~1 week

## Acceptance Criteria
- Users can create share links for files/folders
- Share links work for download and preview
- Share configuration options are respected
- Share revocation works correctly
- Public access is secure and rate-limited