# Capability: Authentication

## MODIFIED Requirements

### Requirement: First Login Password Change
The system SHALL require users with `must_change_password` flag to change their password before accessing the application.

#### Scenario: Default admin must change password
- **GIVEN** admin user created with default password
- **WHEN** admin logs in for the first time
- **THEN** system returns `mustChangePassword: true` in response
- **AND** user is forced to change password before continuing

#### Scenario: Password strength validation
- **GIVEN** user is changing password
- **WHEN** new password does not meet requirements
- **THEN** system rejects with specific error message
- **AND** requirements: min 8 chars, 1 uppercase, 1 number, 1 symbol

#### Scenario: Successful password change
- **GIVEN** user submits valid new password
- **WHEN** password is changed successfully
- **THEN** `must_change_password` is set to false
- **AND** user can access application normally

#### Scenario: Optional username change
- **GIVEN** user is in first-login setup
- **WHEN** user provides new username
- **THEN** username is updated (if not taken)
- **AND** password change is still required

---

### Requirement: Password Strength Validation
The system SHALL validate password strength with specific requirements.

#### Scenario: Minimum length validation
- **GIVEN** password is less than 8 characters
- **WHEN** validation is performed
- **THEN** error "Password must be at least 8 characters" is returned

#### Scenario: Uppercase letter requirement
- **GIVEN** password has no uppercase letter
- **WHEN** validation is performed
- **THEN** error "Password must contain at least 1 uppercase letter" is returned

#### Scenario: Number requirement
- **GIVEN** password has no number
- **WHEN** validation is performed
- **THEN** error "Password must contain at least 1 number" is returned

#### Scenario: Symbol requirement
- **GIVEN** password has no symbol
- **WHEN** validation is performed
- **THEN** error "Password must contain at least 1 symbol" is returned

#### Scenario: Strong password accepted
- **GIVEN** password is "MyPass123!"
- **WHEN** validation is performed
- **THEN** validation passes
