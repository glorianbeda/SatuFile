# Capability: Settings

## ADDED Requirements

### Requirement: Profile Preferences

The system SHALL allow users to update their profile preferences.

#### Scenario: Change language

- **GIVEN** user is on settings page
- **WHEN** user changes language to Indonesian
- **THEN** preference is saved
- **AND** UI language changes immediately

#### Scenario: Change view mode

- **GIVEN** user is on settings page
- **WHEN** user toggles view mode to grid
- **THEN** preference is saved
- **AND** file list displays in grid mode

#### Scenario: Toggle hide dotfiles

- **GIVEN** user is on settings page
- **WHEN** user enables "Hide Dotfiles"
- **THEN** files starting with "." are hidden in file list

---

### Requirement: Password Change

The system SHALL allow users to change their password from settings.

#### Scenario: Successful password change

- **GIVEN** user enters valid current and new password
- **WHEN** user submits the form
- **THEN** password is updated
- **AND** success toast is shown

#### Scenario: Weak password rejected

- **GIVEN** user enters password not meeting requirements
- **WHEN** user tries to submit
- **THEN** validation errors are shown
- **AND** form is not submitted

---

### Requirement: Username Change

The system SHALL allow users to change their username.

#### Scenario: Change username

- **GIVEN** user enters new unique username
- **WHEN** user saves
- **THEN** username is updated
- **AND** success toast is shown

#### Scenario: Duplicate username rejected

- **GIVEN** user enters username already taken
- **WHEN** user tries to save
- **THEN** error message is shown
