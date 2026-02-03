## 1. Security Middleware

- [x] 1.1 Implement global rate limiting middleware in `http/middleware.go`
- [x] 1.2 Implement strict security headers middleware
- [x] 1.3 Register security middlewares in `http/http.go` (or wherever router is initialized)

## 2. Brute Force Protection

- [x] 2.1 Create database schema for tracking failed login attempts
- [x] 2.2 Implement logic to record failed attempts in `auth/` package
- [x] 2.3 Implement account lockout/delay check in login handler
- [x] 2.4 Add rate limiting specific to the `/api/login` endpoint

## 3. Session and JWT Hardening

- [x] 3.1 Reduce JWT expiration to 1 hour in `auth/jwt.go`
- [x] 3.2 Implement token rotation or stricter renewal checks if necessary
- [x] 3.3 Ensure JWT secret is robust and environment-managed

## 4. Verification

- [x] 4.1 Test rate limiting with `curl` or a load testing tool
- [x] 4.2 Verify security headers using browser dev tools or `curl -I`
- [x] 4.3 Verify login lockout by simulating 5+ failed attempts
- [x] 4.4 Ensure legitimate users can still login after the lockout period
