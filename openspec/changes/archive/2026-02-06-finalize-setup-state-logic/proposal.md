## Why

The current setup flow has ambiguous state transitions, leading to users being asked to change their password twice (once in the wizard, once via a popup on the home page). Additionally, the system doesn't clearly distinguish between "authenticated" and "onboarded" (setup complete), causing the setup wizard to potentially keep appearing or blocking the main app incorrectly.

We need explicit, deterministic flags to track setup progress and ensure that once a password is changed during setup, it's immediately recognized by the system as fulfilling all password change requirements.

## What Changes

- **Clear State Transitions**:
  - `POST /api/setup/password` will immediately update the password and set `MustChangePassword = false` and `IsDefaultPassword = false`.
  - The `ForceSetup` flag will remain `true` until the final `POST /api/setup/complete` is called.
- **Frontend Sync**: Ensure `AuthContext` is updated with the new user state (including flags) immediately after the password is changed in the wizard.
- **State Enforcement**: The setup wizard should be the *only* thing visible while `ForceSetup` is true, and it should correctly resume from the last known `SetupStep`.

## Capabilities

### Modified Capabilities
- `authentication`: Ensure password change during setup is terminal for all password-change related requirements.
- `project-setup`: Deterministic state tracking for setup completion.

## Impact

- **Backend**:
  - `routes/api/setup.password.post.go`: Ensure all relevant user flags are cleared.
  - `routes/api/setup.complete.post.go`: Ensure `ForceSetup` is set to `false`.
- **Frontend**:
  - `frontend/src/features/setup/pages/SetupWizardPage.tsx`: Improve step transition logic.
  - `frontend/src/routes.tsx`: Ensure no conflicting modals appear during setup.
