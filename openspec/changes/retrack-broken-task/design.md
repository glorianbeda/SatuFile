# Retrack Broken Task (Fix Setup Auth) - Design

## Context

The system requires initial configuration (creating an admin account, setting storage paths) via a setup wizard. This mode is indicated by a global or configuration state `forceSetup=true`. Currently, the `RequireAuth` middleware in `auth/middleware.go` enforces strict JWT validation on all `/api/*` routes, including `/api/setup/*`. This creates a deadlock: users cannot log in to get a token because they haven't set up the system, but they cannot set up the system because they don't have a token.

## Goals / Non-Goals

**Goals:**
- Allow unauthenticated access to `/api/setup/*` endpoints **ONLY** when the system is in `forceSetup` mode.
- Ensure standard protected routes remain secure.
- Fix the HTTP status codes returned during this phase to be client-friendly.

**Non-Goals:**
- changing the actual setup logic (database creation, etc.), only the access control.

## Decisions

### 1. Middleware Whitelisting
We will modify `RequireAuth` in `auth/middleware.go` to inspect the global configuration for `forceSetup`.
- **Logic**:
  ```go
  if config.Get().ForceSetup && strings.HasPrefix(r.URL.Path, "/api/setup") {
      // Allow access
      next.ServeHTTP(w, r)
      return
  }
  ```
- **Rationale**: This is the most direct and secure way. It limits the exception strictly to the intersection of "Setup Mode Active" AND "Targeting Setup Endpoint".

### 2. HTTP Status Codes
Ensure that redirects use `302 Found` (or `307 Temporary Redirect`) and that API success returns `200 OK`. Avoid `401 Unauthorized` for setup routes in setup mode.

## Risks / Trade-offs

- **Security Risk**: If `forceSetup` is not correctly disabled after setup, the `/api/setup` endpoints remain exposed.
- **Mitigation**: The `setup.complete` endpoint MUST set `forceSetup=false` and persist it immediately upon successful completion. This is already part of the existing design but should be verified.
