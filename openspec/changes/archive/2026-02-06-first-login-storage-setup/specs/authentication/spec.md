# authentication Delta Specification

## Purpose

This delta specification modifies the authentication requirements to add detection for first-time login with default password and forced setup flow redirection.

## MODIFIED Requirements

### Requirement: User Login

The system SHALL authenticate users via username/password and return a JWT token on success. **The system SHALL implement brute force protection by tracking failed login attempts and temporarily locking accounts or implementing delays after 5 consecutive failures.** **The system SHALL check if user has `forceSetup: true` or is using a default password, and if so, redirect to setup flow instead of normal home page.**

#### Scenario: Successful login

- **GIVEN** user exists with valid credentials
- **AND** user has completed setup (`forceSetup: false`)
- **WHEN** POST /api/login with correct username and password
- **THEN** JWT token is returned with user info claims
- **AND** token expires in 1 hour
- **AND** response includes `{ "setupRequired": false }`

#### Scenario: Login with default password triggers setup

- **GIVEN** user exists and is using default password
- **OR** user has `forceSetup: true` in database
- **WHEN** POST /api/login with correct username and password
- **THEN** JWT token is returned with user info claims
- **AND** response includes `{ "setupRequired": true, "setupStep": "password" | "drive" | "partition" }`
- **AND** frontend redirects to `/setup` instead of home page

#### Scenario: Invalid credentials rejected

- **GIVEN** user submits wrong password
- **WHEN** login is processed
- **THEN** 401 Unauthorized is returned

#### Scenario: Brute force lockout

- **GIVEN** user has 5 consecutive failed login attempts
- **WHEN** 6th login attempt is made
- **THEN** 423 Locked is returned
- **AND** account is locked for 15 minutes

---

### Requirement: Protected Routes

The system SHALL protect API routes requiring authentication with middleware that validates JWT tokens. **The system SHALL additionally check if authenticated user has `forceSetup: true` and redirect non-setup routes to `/setup`.**

#### Scenario: Unauthenticated request blocked

- **GIVEN** request has no token
- **WHEN** accessing protected route
- **THEN** 401 Unauthorized is returned

#### Scenario: Admin route protected

- **GIVEN** user is not admin
- **WHEN** accessing admin-only route
- **AND** user has completed setup
- **THEN** 403 Forbidden is returned

#### Scenario: Setup required - non-setup route blocked

- **GIVEN** user is authenticated with valid token
- **AND** user has `forceSetup: true`
- **WHEN** accessing any protected route except `/setup/*`
- **THEN** 302 Redirect to `/setup` is returned
- **AND** user cannot access requested route

#### Scenario: Setup required - setup route allowed

- **GIVEN** user is authenticated with valid token
- **AND** user has `forceSetup: true`
- **WHEN** accessing `/setup` or `/setup/*` routes
- **THEN** request proceeds normally
- **AND** setup wizard is displayed

#### Scenario: Setup completed - all routes accessible

- **GIVEN** user is authenticated with valid token
- **AND** user has `forceSetup: false`
- **WHEN** accessing any protected route
- **THEN** request proceeds normally
- **AND** no setup redirect occurs

---

## ADDED Requirements

### Requirement: Setup Password Change

The system SHALL allow users to change their password during the setup flow.

#### Scenario: Change password in setup

- **GIVEN** user is on setup password step
- **WHEN** POST /api/setup/password is called with `{ "currentPassword": "...", "newPassword": "..." }`
- **AND** current password matches user's password
- **AND** new password meets requirements (min 8 chars)
- **THEN** password is updated in database
- **AND** setup step is advanced to "drive"
- **AND** 200 OK is returned

#### Scenario: Wrong current password rejected

- **GIVEN** user submits incorrect current password
- **WHEN** POST /api/setup/password is called
- **THEN** 401 Unauthorized is returned
- **AND** setup step does not advance

#### Scenario: Weak new password rejected

- **GIVEN** user submits new password less than 8 characters
- **WHEN** POST /api/setup/password is called
- **THEN** 400 Bad Request is returned
- **AND** validation error is shown
- **AND** setup step does not advance

### Requirement: Default Password Detection

The system SHALL store a flag indicating whether a user is still using their default password.

#### Scenario: Default password flag set on registration

- **GIVEN** new user registers
- **WHEN** account is created
- **THEN** `isDefaultPassword` is set to true in database

#### Scenario: Default password flag cleared on password change

- **GIVEN** user has `isDefaultPassword: true`
- **WHEN** user changes password via setup or settings
- **THEN** `isDefaultPassword` is set to false in database
