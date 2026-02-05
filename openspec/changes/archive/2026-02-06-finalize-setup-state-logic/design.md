## Context

The setup flow is intended to secure and configure new user accounts. However, the state transitions are currently leaky, causing redundant UI elements (like the password change popup) to appear even when the user is already addressing the requirement via the setup wizard.

**Current State:**
- `MustChangePassword` and `ForceSetup` both trigger different UI behaviors.
- `SetupPasswordStep` calls `/api/setup/password`.
- The backend handler for that route clears some flags but might not be exhaustive or the frontend state might not sync immediately.

**Constraints:**
- User must be blocked from main app until `ForceSetup` is false.
- Password change must be immediate and terminal for any "must change password" state.

## Goals / Non-Goals

**Goals:**
- **Atomic State Update**: Ensure backend clears `MustChangePassword`, `IsDefaultPassword`, and updates `SetupStep` in a single transaction/update.
- **Frontend Reactive Sync**: Ensure the frontend updates its local `user` state and `token` immediately upon password change success.
- **Wizard Persistence**: Ensure the setup wizard correctly detects and resumes based on the user's current state.

**Non-Goals:**
- Removing the setup wizard entirely.
- Changing the storage quota logic.

## Decisions

### 1. Unified Setup Flag Handling

**Decision:** The backend `SetupPasswordPost` handler will explicitly set `MustChangePassword = false` and `IsDefaultPassword = false`.

**Rationale:**
- This ensures that once the user interacts with the setup wizard's password step, they are no longer considered to have a "must change" requirement globally.

### 2. Immediate Token & State Refresh

**Decision:** The frontend `PasswordSetupStep` will call `updateAuth(token, user)` from `AuthContext` immediately after a successful response.

**Rationale:**
- This refreshes the global state, clearing `mustChangePassword` in the `routes.tsx` logic immediately, preventing any popup from flashing.

### 3. Setup Done Check

**Decision:** Add an explicit `SetupCompletePost` handler call at the end of the wizard which sets `ForceSetup = false`.

**Rationale:**
- This is the terminal state for the onboarding process.

## Risks / Trade-offs

- **Risk**: Interrupted setup.
- **Mitigation**: `SetupWizardPage` already resumes based on `user.setupStep`.

## Open Questions

- None.
