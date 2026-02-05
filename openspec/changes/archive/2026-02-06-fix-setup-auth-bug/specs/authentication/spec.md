# authentication Delta Specification

## Purpose

This delta specification modifies the authentication requirements to fix the bug where setup API endpoints return 401 Unauthorized for authenticated users.

## MODIFIED Requirements

### Requirement: Protected Routes

The system SHALL protect API routes requiring authentication with middleware that validates JWT tokens. **The system SHALL ensure that all protected routes, including setup endpoints (/api/setup/*), properly validate JWT tokens and allow access when a valid token is provided. The setup whitelist check SHALL occur after token validation, not before.**

#### Scenario: Setup API endpoint with valid token

- **GIVEN** request includes valid JWT token in Authorization header
- **AND** user has `forceSetup=true`
- **WHEN** accessing `/api/setup/password`, `/api/setup/drives`, `/api/setup/partition`, or `/api/setup/status`
- **THEN** request proceeds with user context
- **AND** user can complete setup flow

#### Scenario: Setup API endpoint with expired token

- **GIVEN** request includes expired JWT token
- **WHEN** accessing any `/api/setup/*` endpoint
- **THEN** 401 Unauthorized is returned
- **AND** error message indicates token expiration

#### Scenario: Setup API endpoint with no token

- **GIVEN** request has no Authorization header
- **WHEN** accessing any `/api/setup/*` endpoint
- **THEN** 401 Unauthorized is returned

---

### Requirement: Token Extraction

The system SHALL extract JWT tokens from the Authorization header for all HTTP methods (GET, POST, PUT, PATCH, DELETE).

#### Scenario: Token extraction works for GET requests

- **GIVEN** valid JWT token is in Authorization: Bearer header
- **WHEN** GET request to `/api/setup/status` is made
- **THEN** token is extracted successfully
- **AND** request proceeds with user context

#### Scenario: Token extraction works for POST requests

- **GIVEN** valid JWT token is in Authorization: Bearer header
- **WHEN** POST request to `/api/setup/password` is made
- **THEN** token is extracted successfully
- **AND** request proceeds with user context

#### Scenario: Token extraction works for all HTTP methods

- **GIVEN** valid JWT token is in Authorization: Bearer header
- **WHEN** request to any protected endpoint is made (GET, POST, PUT, PATCH, DELETE)
- **THEN** token is extracted successfully regardless of HTTP method
