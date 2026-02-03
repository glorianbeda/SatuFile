# Fix Setup Auth Bug - Design

## Context

The auth middleware has a bug where setup API endpoints return 401 Unauthorized for authenticated users with `forceSetup=true`. The error message "401 Unauthorized" suggests that token validation is failing before the setup check even runs.

**Current State:**
- When user with `forceSetup=true` tries to access `/api/setup/password`, they get 401 Unauthorized
- The `/api/setup/status` endpoint works correctly (returns 200 with setup info)
- The difference suggests the issue might be in how POST vs GET requests are handled
- Vite frontend shows `ECONNREFUSED` - backend may not be running or not accessible

**Root Cause Analysis:**
1. Looking at the middleware code, `RequireAuth` validates tokens before checking setup status
2. The token validation happens at lines 85-96 in `auth/middleware.go`
3. Setup whitelisting happens AFTER token validation (lines 98-106)
4. If token validation fails, it returns 401 before setup whitelist check

**The actual issue:** The POST `/api/setup/password` endpoint requires `protectedAPI` middleware which uses `auth.RequireAuth`. The token validation may be failing for POST requests specifically.

## Goals / Non-Goals

**Goals:**
- Fix 401 Unauthorized error for `/api/setup/*` endpoints when valid token is provided
- Ensure all setup API endpoints (GET and POST) work correctly with authenticated users
- Verify the token extraction and validation works consistently

**Non-Goals:**
- Changing the overall architecture of auth flow
- Modifying the setup wizard UI

## Decisions

### 1. Token Validation Fix

**Decision:** Debug and fix the token validation flow to ensure POST requests work correctly.

**Rationale:**
- The fact that `/api/setup/status` (GET) works but `/api/setup/password` (POST) returns 401 suggests the issue is with how POST requests are handled
- The `extractToken` function should work the same for GET and POST
- JWT validation should not be request-method dependent

**Investigation areas:**
1. Check if the Authorization header is being sent correctly by frontend
2. Verify the token format is correct (3 parts separated by dots)
3. Check if the token is expired or malformed
4. Verify the JWT secret matches between generation and validation

### 2. Middleware Order

**Decision:** Keep current middleware order but add debug logging.

**Rationale:**
- Token validation must happen before setup check (security requirement)
- Setup whitelist check must happen after token validation (functional requirement)
- The order is correct: validate token → check setup status → allow if whitelisted

## Risks / Trade-offs

### Risk: Token format corruption between frontend and backend

**Risk:** The token might be getting corrupted when passed between frontend and backend.

**Mitigation:** Add logging to verify token format at each step of the flow.

### Risk: Frontend caching expired tokens

**Risk:** The frontend might be caching an expired token and reusing it.

**Mitigation:** Frontend should fetch fresh token after password change (this is already implemented).

## Implementation Plan

1. **Add debug logging** to auth middleware to trace token validation
2. **Verify token extraction** works for both GET and POST
3. **Test with curl** to isolate the issue from frontend bugs
4. **Fix any bugs** found in the token validation or whitelisting logic

## Open Questions

1. **Is the backend server running when the error occurs?** The Vite error `ECONNREFUSED` suggests the backend might be down.
2. **Is the token being sent correctly by the frontend?** Need to verify the Authorization header format.
3. **Is there a CORS issue** preventing the frontend from sending the Authorization header?
