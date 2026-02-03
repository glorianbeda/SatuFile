# Retrack Broken Task (Fix Setup Auth) - Proposal

## Why

The previous attempt to fix the setup authentication bug was incomplete or resulted in persistent errors. Users with `forceSetup=true` are still incorrectly encountering "401 Unauthorized" errors when accessing setup endpoints (e.g., `/api/setup/password`), preventing them from completing the initial setup. This change re-tracks the work to ensure a correct and robust fix.

## What Changes

- comprehensive review and fix of the `RequireAuth` middleware in `auth/middleware.go`.
- Ensure setup routes (`/api/setup/*`) are correctly whitelisted and accessible for users in the `forceSetup` state.
- Verify token extraction and validation logic to prevent premature failures for valid setup requests.
- Correctly handle redirects and HTTP status codes for setup flows.

## Capabilities

### Modified Capabilities

- `authentication`: Fix auth middleware to properly whitelist setup routes and handle `forceSetup` state.

## Impact

### Affected Code

- **Backend (Go)**:
  - `auth/middleware.go`: Primary location of the fix for `RequireAuth` logic.

### Systems

- User Setup Flow: Critical for initial system configuration.
