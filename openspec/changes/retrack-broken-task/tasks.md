## 1. Analysis & Verification

- [ ] 1.1 Analyze `auth/middleware.go` to understand current `RequireAuth` logic
- [ ] 1.2 Verify `config` package usage for `forceSetup` flag
- [ ] 1.3 Reproduce the 401 error with a test case or manual verification (if possible)

## 2. Implementation

- [ ] 2.1 Modify `RequireAuth` in `auth/middleware.go` to whitelist setup routes when `forceSetup=true`
- [ ] 2.2 Ensure whitelisted requests bypass token validation safely
- [ ] 2.3 Verify `setup.complete` endpoint correctly disables `forceSetup` (if accessible)

## 3. Verification

- [ ] 3.1 Verify `/api/setup/password` returns 200/302 in setup mode
- [ ] 3.2 Verify normal routes still require auth
- [ ] 3.3 Verify setup routes require auth when `forceSetup=false`
