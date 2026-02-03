## Context

Hosting an application on a home server introduces significant risks if the server is compromised. Since Cloudflare Tunnel is used, we have some perimeter protection, but the application layer must be resilient against targeted attacks like brute-forcing and credential stuffing.

## Goals / Non-Goals

**Goals:**
- Implement application-level rate limiting.
- Protect against brute-force attacks on login.
- Enhance session security (short-lived tokens, rotation).
- Ensure all sensitive endpoints are protected by security headers.

**Non-Goals:**
- Setting up network-level firewalls (assumed managed by the OS/router).
- Implementing hardware-level encryption.

## Decisions

- **Rate Limiting**: Use a memory-based rate limiter (e.g., `golang.org/x/time/rate`) for the initial implementation. For login specifically, a more persistent store like SQLite (already used) can track failed attempts.
- **Brute Force Protection**: 
    - Track failed attempts by IP/Username in the database.
    - Implement a progressive delay or temporary lockout (e.g., 5 failures = 15-minute lockout).
- **Session Management**: 
    - Shorten JWT expiration to 1 hour (currently likely longer).
    - Implement token renewal logic to balance UX and security.
- **Security Headers**: Use a dedicated middleware to inject `Content-Security-Policy`, `X-Frame-Options`, and `Strict-Transport-Security`.

## Risks / Trade-offs

- **[Risk]**: False positives in rate limiting blocking legitimate users.
    - **Mitigation**: Set generous limits for non-sensitive endpoints and use higher thresholds for login.
- **[Risk]**: Database overhead for tracking failed attempts.
    - **Mitigation**: Index the tracking table and periodically prune old entries.
