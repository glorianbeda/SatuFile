## 1. Backend Implementation

- [ ] 1.1 Update `share/share.go` to support folder sharing
  - [ ] Add `IsFolder` field to `Link` struct (or use existing `Type` field)
  - [ ] Ensure `Path` field can store folder paths
  - [ ] Add validation for folder paths

- [ ] 1.2 Update `routes/api/share.post.go` to handle folder sharing
  - [ ] Accept folder type in request
  - [ ] Create share links for folders
  - [ ] Validate folder exists before creating share

- [ ] 1.3 Update `routes/api/share.public.get.go` to support folder browsing
  - [ ] Add logic to handle folder paths
  - [ ] Return list of files and folders for shared folder
  - [ ] Support navigation to subfolders
  - [ ] Implement read-only access (no modification endpoints)

- [ ] 1.4 Update `routes/api/shares.get.go` to include folder shares
  - [ ] Return list of all shares including folders
  - [ ] Include share type (file/folder) in response

- [ ] 1.5 Update `routes/api/share.delete.go` to handle folder shares
  - [ ] Delete folder share links
  - [ ] Clean up database records

## 2. Frontend Components

- [ ] 2.1 Update `frontend/src/components/files/ShareDialog.tsx`
  - [ ] Update dialog title to handle both files and folders
  - [ ] Show appropriate icon based on type
  - [ ] Pass folder type to API when creating share

- [ ] 2.2 Update `frontend/src/components/files/FileRow.tsx`
  - [ ] Add `isShared` prop to FileData interface
  - [ ] Add FolderShared icon display after modified date
  - [ ] Show FolderShared icon only when `isShared` is true
  - [ ] Add Share option to folder context menu

- [ ] 2.3 Update `frontend/src/components/files/FileGrid.tsx`
  - [ ] Add `isShared` prop to FileData interface
  - [ ] Add FolderShared icon display in grid view
  - [ ] Show FolderShared icon only when `isShared` is true

- [ ] 2.4 Update `frontend/src/components/files/FileList.tsx`
  - [ ] Pass `isShared` prop to FileRow components
  - [ ] Handle share status from API response

- [ ] 2.5 Update `frontend/src/api/files.ts`
  - [ ] Add `isShared` field to file/folder response types
  - [ ] Update API calls to include share status

## 3. Public Share Page

- [ ] 3.1 Update `frontend/src/features/shares/PublicSharePage.tsx`
  - [ ] Add file browser UI similar to main file management view
  - [ ] Display files and folders in list or grid view
  - [ ] Add breadcrumb navigation for folder hierarchy
  - [ ] Implement read-only access (no upload, create, edit, delete)
  - [ ] Add download functionality for files
  - [ ] Add preview functionality for previewable files
  - [ ] Handle expired/invalid share tokens with error messages

- [ ] 3.2 Update `frontend/src/api/files.ts` (or create new share API)
  - [ ] Add API function to fetch shared folder contents
  - [ ] Add API function to fetch shared file info
  - [ ] Add API function to download shared file

- [ ] 3.3 Update `frontend/src/routes.tsx`
  - [ ] Add route for public share page
  - [ ] Ensure route doesn't require authentication

## 4. Integration and Testing

- [ ] 4.1 Test folder sharing
  - [ ] Create share link for folder
  - [ ] Verify share link works
  - [ ] Verify all subfolders and files are accessible
  - [ ] Verify expiration works correctly

- [ ] 4.2 Test public share page
  - [ ] Access shared folder via public URL
  - [ ] Navigate through folder structure
  - [ ] Download files from shared folder
  - [ ] Preview files from shared folder
  - [ ] Verify no modification options are available

- [ ] 4.3 Test visual indicators
  - [ ] Verify FolderShared icon appears for shared folders
  - [ ] Verify FolderShared icon appears for shared files
  - [ ] Verify icon doesn't appear for unshared items

- [ ] 4.4 Test error cases
  - [ ] Test expired share link
  - [ ] Test invalid share token
  - [ ] Test deleted shared folder

- [ ] 4.5 Test file sharing (existing functionality)
  - [ ] Verify file sharing still works
  - [ ] Verify FolderShared icon appears for shared files
  - [ ] Verify public share page works for individual files
