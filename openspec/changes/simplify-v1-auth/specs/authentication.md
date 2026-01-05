## REMOVED Requirements

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

---

## ADDED Requirements

### Requirement: Single Admin User

The system SHALL initialize with a single administrator account on first startup.

#### Scenario: Auto-create admin on startup

- **GIVEN** server is starting for first time
- **WHEN** no users exist in database
- **THEN** default admin user is created with username "admin" and password "Admin123!"
- **AND** user has admin privileges

#### Scenario: Skip admin creation if exists

- **GIVEN** server is starting
- **WHEN** admin user already exists
- **THEN** no new user is created
- **AND** server continues normally

---

### Requirement: Admin Password Change

The system SHALL allow admin to change their password from settings.

#### Scenario: Password changed successfully

- **GIVEN** admin is logged in and on settings page
- **WHEN** admin submits valid current and new password
- **THEN** password is updated
- **AND** success toast is shown

#### Scenario: Invalid current password

- **GIVEN** admin enters incorrect current password
- **WHEN** attempting to change password
- **THEN** error message is displayed
- **AND** password is not changed

---

## MODIFIED Requirements

### Requirement: User Login

**BEFORE:** The system SHALL authenticate users via username/password and return a JWT token on success.

**AFTER:** The system SHALL authenticate single administrator via username/password and return a JWT token on success.

#### Scenario: Successful login

- **GIVEN** admin user exists with credentials admin/Admin123!
- **WHEN** POST /api/login with correct username and password
- **THEN** JWT token is returned with admin claims
- **AND** token expires in 2 hours

#### Scenario: Invalid credentials rejected

- **GIVEN** user submits wrong password
- **WHEN** login is processed
- **THEN** 401 Unauthorized is returned

---

### Requirement: Login Page UI

**BEFORE:** The system SHALL provide a login page with username/password form, validation feedback, and redirect on success.

**AFTER:** The system SHALL provide a login page with username/password form for single admin user, validation feedback, and redirect on success.

#### Scenario: Login form displays

- **GIVEN** user navigates to /login
- **WHEN** page loads
- **THEN** form with username, password fields and submit button appears
- **AND** no signup link is visible

#### Scenario: Login redirects on success

- **GIVEN** admin submits valid credentials
- **WHEN** login succeeds
- **THEN** user is redirected to home page
- **AND** token is stored in localStorage