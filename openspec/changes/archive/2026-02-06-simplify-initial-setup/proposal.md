## Why

The current initial setup flow is confusing and error-prone because it requires users to enter the default password (which is often hidden or unknown) before setting their own. Additionally, authentication errors (401) can occur during the setup process due to strict token validation before the setup is complete. This change aims to simplify the first-time login experience by removing the need for the default password and robustifying the authentication check during setup.

## What Changes

- **Simplified Setup Flow**: The initial password setup step will no longer require the `currentPassword` field when `forceSetup` is true.
- **Backend Validation**: The backend will trust the `forceSetup` state and allow password updates without the old password during the initial setup phase.
- **Auth Robustness**: Ensure `extractToken` and `authenticate` middleware are robust against minor formatting issues (like extra spaces) and handle setup-specific API calls correctly (returning JSON errors instead of redirects where appropriate). (Note: Some of this was addressed in `fix-setup-auth-bug`, but we will ensure it supports the simplified flow).

## Capabilities

### New Capabilities
- `setup-flow-v2`: Simplified setup flow that bypasses default password check during initial onboarding.

### Modified Capabilities
- `authentication`: Update password change logic to handle setup-mode specific validation rules.

## Impact

- **Backend**:
  - `routes/api/setup.password.post.go`: Update to make `currentPassword` optional if user is in `forceSetup` mode.
  - `auth/middleware.go`: Ensure robust token handling (already largely done, but verify context).
- **Frontend**:
  - `frontend/src/features/setup/PasswordSetupStep.tsx`: Remove the "Current Password" field from the UI.
  - `frontend/src/api/setup.ts`: Update the API call type definition.
