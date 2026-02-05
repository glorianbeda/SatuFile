## MODIFIED Requirements

### Requirement: User Password Setup
The system SHALL ensure that password changes during setup are immediately and globally recognized.

#### Scenario: Successful password change during setup
- **WHEN** user submits new password in the setup wizard
- **THEN** system SHALL update the password
- **AND** system SHALL set `MustChangePassword` to `false`
- **AND** system SHALL set `IsDefaultPassword` to `false`
- **AND** system SHALL return a fresh JWT token and updated user object

#### Scenario: Atomic setup completion
- **WHEN** user completes the final setup step
- **THEN** system SHALL set `ForceSetup` to `false`
- **AND** system SHALL allow access to all protected application features

### Requirement: Setup Wizard Persistence
The system SHALL enforce the setup wizard until onboarding is fully complete.

#### Scenario: App access during setup
- **WHEN** user has `ForceSetup` set to `true`
- **THEN** system SHALL only allow access to the setup wizard and its API dependencies
- **AND** system SHALL NOT display any standard application notifications or modals (like the profile password change prompt)
