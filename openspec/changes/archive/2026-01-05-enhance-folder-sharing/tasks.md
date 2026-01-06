## 1. Backend Implementation

- [x] 1.1 Update `share/share.go` to support folder sharing
  - [x] Add `IsFolder` field to `Link` struct (or use existing `Type` field)
  - [x] Ensure `Path` field can store folder paths
  - [x] Add validation for folder paths

- [x] 1.2 Update `routes/api/share.post.go` to handle folder sharing
  - [x] Accept folder type in request
  - [x] Create share links for folders
  - [x] Validate folder exists before creating share

- [x] 1.3 Update `routes/api/share.public.get.go` to support folder browsing
  - [x] Add logic to handle folder paths
  - [x] Return list of files and folders for shared folder
  - [x] Support navigation to subfolders
  - [x] Implement read-only access (no modification endpoints)

- [x] 1.4 Update `routes/api/shares.get.go` to include folder shares
  - [x] Return list of all shares including folders
  - [x] Include share type (file/folder) in response

- [x] 1.5 Update `routes/api/share.delete.go` to handle folder shares
  - [x] Delete folder share links
  - [x] Clean up database records

## 2. Frontend Components

- [x] 2.1 Update `frontend/src/components/files/ShareDialog.tsx`
  - [x] Update dialog title to handle both files and folders
  - [x] Show appropriate icon based on type
  - [x] Pass folder type to API when creating share

- [x] 2.2 Update `frontend/src/components/files/FileRow.tsx`
  - [x] Add `isShared` prop to FileData interface
  - [x] Add FolderShared icon display after modified date
  - [x] Show FolderShared icon only when `isShared` is true
  - [x] Add Share option to folder context menu

- [x] 2.3 Update `frontend/src/components/files/FileGrid.tsx`
  - [x] Add `isShared` prop to FileData interface
  - [x] Add FolderShared icon display in grid view
  - [x] Show FolderShared icon only when `isShared` is true

- [x] 2.4 Update `frontend/src/components/files/FileList.tsx`
  - [x] Pass `isShared` prop to FileRow components
  - [x] Handle share status from API response

- [x] 2.5 Update `frontend/src/api/files.ts`
  - [x] Add `isShared` field to file/folder response types
  - [x] Update API calls to include share status

## 3. Public Share Page

- [x] 3.1 Update `frontend/src/features/shares/PublicSharePage.tsx`
  - [x] Add file browser UI similar to main file management view
  - [x] Display files and folders in list or grid view
  - [x] Add breadcrumb navigation for folder hierarchy
  - [x] Implement read-only access (no upload, create, edit, delete)
  - [x] Add download functionality for files
  - [x] Add preview functionality for previewable files
  - [x] Handle expired/invalid share tokens with error messages

- [x] 3.2 Update `frontend/src/api/files.ts` (or create new share API)
  - [x] Add API function to fetch shared folder contents
  - [x] Add API function to fetch shared file info
  - [x] Add API function to download shared file

- [x] 3.3 Update `frontend/src/routes.tsx`
  - [x] Add route for public share page
  - [x] Ensure route doesn't require authentication

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
