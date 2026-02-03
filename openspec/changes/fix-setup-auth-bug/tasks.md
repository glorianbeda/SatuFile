# Fix Setup Auth Bug - Implementation Tasks

## 1. Investigation

- [x] 1.1 Start the backend server and verify it's running
- [x] 1.2 Test `/api/setup/status` with curl to confirm it works
- [x] 1.3 Test `/api/setup/password` with curl to reproduce the 401 error
- [x] 1.4 Check if the token is valid and not expired
- [x] 1.5 Verify the Authorization header is being sent correctly

## 2. Debug Token Validation

- [x] 2.1 Add debug logging to `extractToken` function in auth/middleware.go
- [x] 2.2 Add debug logging to `RequireAuth` middleware in auth/middleware.go
- [x] 2.3 Log the token received at each step of validation
- [x] 2.4 Log whether the token validation passed or failed

## 3. Root Cause Fix

- [x] 3.1 Fix any issues found in token extraction logic
- [x] 3.2 Fix any issues in JWT validation
- [x] 3.3 Ensure POST requests work the same as GET for token validation
- [x] 3.4 Remove debug logging after fix is confirmed

## 4. Testing

- [x] 4.1 Test all setup API endpoints with curl
- [x] 4.2 Test setup flow from frontend
- [x] 4.3 Verify `/api/setup/status`, `/api/setup/drives`, `/api/setup/password`, `/api/setup/partition` all work
- [x] 4.4 Verify setup redirect works for protected routes when `forceSetup=true`
