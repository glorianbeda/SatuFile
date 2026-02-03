## MODIFIED Requirements

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
