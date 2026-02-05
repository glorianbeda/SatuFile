# Fix Setup Auth Bug - Proposal

## Why

The setup authentication middleware has a bug where it incorrectly returns 401 Unauthorized for setup API endpoints. When a user with `forceSetup=true` tries to access `/api/setup/password`, the auth middleware should allow the request (since setup routes are whitelisted), but instead it's returning 401. This prevents users from completing the setup flow.

Additionally, the frontend dev server (Vite) shows `ECONNREFUSED` when trying to proxy to the backend, indicating the backend may not be running or is not accessible.

## What Changes

- Fix the auth middleware to properly handle setup route whitelisting
- Ensure setup API endpoints `/api/setup/*` are accessible to authenticated users with `forceSetup=true`
- Fix the redirect logic to return 302 HTTP redirect instead of text response for setup routes
- Verify the token extraction and validation flow for setup endpoints

## Capabilities

### Modified Capabilities

- `authentication`: Fix auth middleware to properly whitelist setup routes and return correct HTTP status codes

## Impact

### Affected Code

- **Backend (Go)**:
  - `auth/middleware.go`: Fix `RequireAuth` middleware to properly whitelist setup routes
  - The issue is likely in how the middleware checks the request path or handles the redirect

### Dependencies

- None new

### Root Cause Analysis

The error "401 Unauthorized" for `/api/setup/password` suggests the token validation itself is failing before reaching the setup check. This could be:
1. Token format issue (the token might be malformed from login response)
2. The `extractToken` function not properly reading the Authorization header
3. The JWT validation failing before the setup check runs
