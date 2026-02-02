## 1. Share UI

- [x] 1.1 In `frontend/src/components/files/SharesPanel.tsx`, update the `formatDate` function to show more specific time (e.g., time of day) for expirations within 24 hours, and precise date/time for longer durations.
- [x] 1.2 Fix `SharesPanel.tsx` header layout to ensure it's not covered by the main navigation topbar (adjust z-index or margins/padding).

## 2. Hidden Files

- [x] 2.1 In `frontend/src/components/files/RenameDialog.tsx` (and NewFolderDialog if applicable), add a helper text below the input field: "Files starting with '.' will be hidden. To view hidden files, go to Settings > Show Hidden Files."
- [x] 2.2 In `frontend/src/components/files/FileContextMenu.tsx` and `FileRow.tsx` (actions menu), add a "Hide" option that renames the file/folder by prepending a dot.
- [x] 2.3 Ensure the "Hide" option is only visible if the file is not already hidden (doesn't start with dot).

## 3. Verification

- [ ] 3.1 Verify share expiration displays precise time.
- [ ] 3.2 Verify SharesPanel header is visible and back button is clickable.
- [ ] 3.3 Verify helper text appears when creating/renaming files.
- [ ] 3.4 Verify "Hide" option works and renames file with a dot prefix.