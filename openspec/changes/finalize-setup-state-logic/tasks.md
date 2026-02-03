## 1. Backend Implementation

- [x] 1.1 Update `SetupPasswordPost` in `routes/api/setup.password.post.go` to explicitly clear `MustChangePassword` and `IsDefaultPassword` flags.
- [x] 1.2 Update `SetupCompletePost` in `routes/api/setup.complete.post.go` to set `ForceSetup` to `false`.

## 2. Frontend Synchronization

- [x] 2.1 Update `PasswordSetupStep.tsx` to call `updateAuth(token, user)` from `AuthContext` immediately after successful password change.
- [x] 2.2 Update `SetupWizardPage.tsx` to ensure `AuthContext` state is kept in sync with the current step.
- [x] 2.3 Verify `routes.tsx` correctly hides `ChangePasswordModal` when `setupRequired` is true (double check previous fix).

## 3. Verification

- [x] 3.1 Verify that clicking "Continue" in password step immediately clears any other password change prompts.
- [x] 3.2 Verify that setup continues to show until the very last step is completed.
