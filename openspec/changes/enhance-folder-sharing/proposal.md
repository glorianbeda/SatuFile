# Change: Enhance Folder Sharing with Recursive Access

## Why
The current sharing system only supports sharing individual files, not folders. Users need the ability to share entire folders with all their contents, and recipients should be able to browse the shared folder structure in a read-only view similar to the main file management interface.

## What Changes
- Add folder sharing capability with recursive access to all subfolders and files
- Implement read-only public view for shared folders with file management UI
- Add visual indicator (FolderShared icon) for shared folders and files
- Update share dialog to support folder sharing
- Modify share API to handle folder paths and recursive access
- Create public share page component with read-only file browser

## Impact
- Affected specs: `files` (new sharing requirements), `shares` (new capability)
- Affected code: 
  - Backend: `share/share.go`, `routes/api/share.post.go`
  - Frontend: `frontend/src/components/files/ShareDialog.tsx`, `frontend/src/components/files/FileRow.tsx`
  - New: `frontend/src/features/shares/PublicSharePage.tsx` (enhanced)
