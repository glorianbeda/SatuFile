## 1. Backend

- [x] 1.1 In `routes/api/share.post.go`, inspect `SharePost` function. Ensure it correctly parses `expires` (value) and `unit`.
- [x] 1.2 Verify the `ExpirationTime` calculation logic. Specifically check if `unit` "hour" vs "hours" matters and if it handles cases where `unit` might be empty or malformed.
- [x] 1.3 Add logging or improve error handling if the expiration time calculation fails or results in a zero duration when it shouldn't.

## 2. Frontend

- [x] 2.1 In `frontend/src/api/files.ts`, check `createShare` function. Ensure arguments are passed in the correct order and format expected by the backend JSON payload.
- [x] 2.2 In `frontend/src/components/files/ShareDialog.tsx`, verify that the `unit` passed to `onCreateShare` matches the dropdown values ("hour", "day", etc.) and the backend expectations.
- [x] 2.3 Fixed `SharesPanel.tsx` to correctly read `expires_at` from API response instead of `expires`, solving the "no expiration" display issue.

## 3. Verification

- [ ] 3.1 Create a share link with 1 hour expiration. Verify backend logs/response show correct expiration time (approx 1 hour from now).
- [ ] 3.2 Create a share link with 7 days expiration. Verify expiration time.
- [ ] 3.3 Create a permanent link. Verify expiration is null or very far in future.