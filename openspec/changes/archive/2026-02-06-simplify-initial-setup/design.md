## Context

Currently, the setup process requires users to change their default password (`forceSetup=true`). The UI prompts for "Current Password", "New Password", and "Confirm Password". For a fresh install or first login, the "Current Password" is a default value (often hidden or provided by admins) which adds friction. Users sometimes don't know the default password or find it redundant to enter.

Additionally, we've encountered 401 Unauthorized errors during this flow because the token validation was too strict or the client wasn't handling auth headers perfectly. While some of this was patched, a robust simplified flow is desired.

**Current State:**
- `POST /api/setup/password` expects `currentPassword`.
- Frontend shows 3 input fields.
- Backend validates `currentPassword` against the stored hash.

**Constraints:**
- Must maintain security: Only allow bypassing `currentPassword` if the user is genuinely in a "forced setup" state.
- Backend is Go, Frontend is React.

## Goals / Non-Goals

**Goals:**
- **Simplify UI**: Remove "Current Password" field from the setup screen.
- **Backend Support**: Update `POST /api/setup/password` to treat `currentPassword` as optional *only* when `user.ForceSetup` is true.
- **Robustness**: Ensure the flow works without 401 errors (verify token handling).

**Non-Goals:**
- Removing password complexity requirements (min length, symbols, etc. remain).
- changing the general auth flow for *non-setup* password changes (e.g., in Settings profile).

## Decisions

### 1. Backend Logic for Password Change

**Decision:** Modify `SetupPasswordPost` handler.
- Check `user.ForceSetup`.
- If `true`, `currentPassword` in the request body is OPTIONAL.
- If `false` (shouldn't happen on this route, but for safety), `currentPassword` is REQUIRED.
- If `currentPassword` is provided, validate it. If not provided and `ForceSetup` is true, skip validation.

**Rationale:**
- Trusting `ForceSetup` is safe because the user is already authenticated via JWT (which proves they have the valid default password/token).
- If they are logged in and in `ForceSetup` mode, they have the right to set the new password.

**Alternatives Considered:**
- **Pre-fill default password in frontend**: Insecure (exposes default password in source/DOM) and hacky.
- **Separate endpoint**: `/api/setup/initial-password` vs `/api/change-password`. Possible, but updating existing `/api/setup/password` is cleaner as it's already specific to setup.

### 2. Frontend Changes

**Decision:** Remove "Current Password" input from `PasswordSetupStep` component.
- The payload sent to backend will omit `currentPassword` or send an empty string.

**Rationale:**
- Matches backend changes. Reduces user friction.

### 3. Auth Token Handling

**Decision:** Ensure `extractToken` handles standard `Bearer` tokens robustly.
- (Already implemented in previous fix, will verify).

## Risks / Trade-offs

**Risk:** **Security reduction?**
- *Concern:* Does skipping current password check reduce security?
- *Mitigation:* No, because the user must validly log in first to access the setup wizard. The JWT acts as proof of possession of the current (default) password. `ForceSetup` ensures this only applies to the specific onboarding phase.

**Risk:** **Accidental skip?**
- *Concern:* What if `ForceSetup` is stuck on `true`?
- *Mitigation:* The successful completion of this step sets `ForceSetup` to `false` (or advances step).

## Migration Plan

1.  **Backend Update**: Deploy new handler logic.
2.  **Frontend Update**: Deploy new UI.
3.  **Backwards Compatibility**: Old frontends sending `currentPassword` will still work (validation is optional/skipped, or validated if present).

## Open Questions

- None.
