# authentication Specification

## Purpose
This specification defines the authentication and authorization requirements for the system, including secure user login with brute force protection, token-based session management, and route protection.
## Requirements
### Requirement: User Registration
The system SHALL allow users to register with username, password, and optional email. Passwords MUST be hashed with bcrypt before storage.

#### Scenario: Successful registration
- **GIVEN** signup is enabled
- **WHEN** user submits valid username and password (min 8 chars)
- **THEN** user is created in database with hashed password
- **AND** 200 OK is returned

#### Scenario: Duplicate username rejected
- **GIVEN** a user with username "john" exists
- **WHEN** another user attempts signup with username "john"
- **THEN** 409 Conflict is returned

#### Scenario: Weak password rejected
- **GIVEN** user submits password less than 8 characters
- **WHEN** signup is processed
- **THEN** 400 Bad Request is returned

---

### Requirement: User Login
The system SHALL authenticate users via username/password and return a JWT token on success. **The system SHALL implement brute force protection by tracking failed login attempts and temporarily locking accounts or implementing delays after 5 consecutive failures.**

#### Scenario: Successful login
- **GIVEN** user exists with valid credentials
- **WHEN** POST /api/login with correct username and password
- **THEN** JWT token is returned with user info claims
- **AND** token expires in 1 hour

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

### Requirement: Token Validation
The system SHALL validate JWT tokens on protected routes using HS256 signature verification. **Tokens SHALL be short-lived to minimize the impact of token theft.**

#### Scenario: Valid token accepted
- **GIVEN** request includes valid JWT in Authorization header
- **WHEN** accessing protected route
- **THEN** request proceeds with user context

#### Scenario: Expired token rejected
- **GIVEN** JWT token has expired
- **WHEN** accessing protected route
- **THEN** 401 Unauthorized is returned

---

### Requirement: Token Renewal
The system SHALL allow token renewal before expiration to maintain user sessions.

#### Scenario: Token renewed
- **GIVEN** user has valid token expiring soon
- **WHEN** POST /api/renew is called
- **THEN** new token with fresh expiration is returned

---

### Requirement: Protected Routes
The system SHALL protect API routes requiring authentication with middleware that validates JWT tokens.

#### Scenario: Unauthenticated request blocked
- **GIVEN** request has no token
- **WHEN** accessing protected route
- **THEN** 401 Unauthorized is returned

#### Scenario: Admin route protected
- **GIVEN** user is not admin
- **WHEN** accessing admin-only route
- **THEN** 403 Forbidden is returned

---

### Requirement: Login Page UI
The system SHALL provide a login page with username/password form, validation feedback, and redirect on success.

#### Scenario: Login form displays
- **GIVEN** user navigates to /login
- **WHEN** page loads
- **THEN** form with username, password fields and submit button appears

#### Scenario: Login redirects on success
- **GIVEN** user submits valid credentials
- **WHEN** login succeeds
- **THEN** user is redirected to home page
- **AND** token is stored in localStorage

---

### Requirement: Signup Page UI
The system SHALL provide a signup page with registration form and validation.

#### Scenario: Signup form displays
- **GIVEN** user navigates to /signup
- **WHEN** page loads
- **THEN** form with username, password, confirm password fields appears

#### Scenario: Password mismatch shown
- **GIVEN** password and confirm password don't match
- **WHEN** user attempts submit
- **THEN** validation error is displayed

