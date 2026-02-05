## 1. Backend

- [x] 1.1 Update `routes/api/setup.password.post.go` to handle optional `currentPassword`
- [x] 1.2 Add logic to check `user.ForceSetup` before allowing password change without current password
- [x] 1.3 Add test case for optional password change flow in `routes/setup_test.go`

## 2. Frontend

- [x] 2.1 Update `frontend/src/features/setup/PasswordSetupStep.tsx` to hide/remove "Current Password" input
- [x] 2.2 Update form validation to not require current password
- [x] 2.3 Verify the setup flow works end-to-end
