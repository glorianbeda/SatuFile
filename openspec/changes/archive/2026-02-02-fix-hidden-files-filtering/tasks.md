## 1. Filter Implementation

- [x] 1.1 In `frontend/src/features/files/HomePage.tsx`, implement filtering logic to hide files starting with a dot unless "show hidden files" is enabled. (Implemented using `user.hideDotfiles` from `useAuth`).
- [x] 1.2 Add a state/setting for `showHiddenFiles`. (Synced with global user profile setting `hideDotfiles`).
- [x] 1.3 Add a UI toggle (e.g., in the toolbar or settings menu) to switch `showHiddenFiles`. (Added "Opsi Tampilan" menu in `FolderToolbar`).

## 2. Verification

- [ ] 2.1 Verify that files starting with '.' are hidden by default.
- [ ] 2.2 Verify that enabling "show hidden files" reveals them.
- [ ] 2.3 Verify that newly hidden files disappear immediately if the setting is off.
- [x] 2.4 Fixed `SharesPanel` header being covered by global navigation bar by adding correct padding and sticky positioning.
- [x] 2.5 Improved `SharesPanel` expiration display to show precise time/hours remaining.