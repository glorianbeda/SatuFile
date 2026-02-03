## Why

The application is hosted on a home server and exposed via a Cloudflare Tunnel. To mitigate the risk of unauthorized access that could lead to severe consequences (e.g., ransomware/encryption of local devices), enhanced security measures such as Rate Limiting, Brute Force protection, and strict session management are required.

## What Changes

- **Rate Limiting**: Implement middleware to limit the number of requests from a single source within a specific timeframe.
- **Brute Force Protection**: Implement account lockout or delays after multiple failed login attempts.
- **Enhanced Session Security**: Implement stricter JWT/Session expiration and rotation.
- **Security Headers**: Ensure all critical security headers (HSTS, CSP, etc.) are strictly enforced.

## Capabilities

### New Capabilities
- `security-hardening`: Comprehensive security middleware and configurations for home-server environments.

### Modified Capabilities
- `authentication`: Update authentication requirements to include brute force protection and stricter session rules.

## Impact

- `auth/` (backend)
- `http/` (backend)
- `main.go` (backend)
- Security profile of the entire system.
