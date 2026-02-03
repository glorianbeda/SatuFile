## MODIFIED Requirements

### Requirement: User Password Setup
The system SHALL allow users to set their password during the initial setup process.

#### Scenario: Set initial password (simplified)
- **WHEN** user is in `forceSetup` mode
- **AND** user submits `newPassword` and `confirmPassword` to `/api/setup/password`
- **AND** `currentPassword` is omitted or empty
- **THEN** system updates the user's password to `newPassword`
- **AND** system clears `isDefaultPassword` flag
- **AND** system advances `setupStep` to 'drive'

#### Scenario: Set initial password (legacy/fallback)
- **WHEN** user is in `forceSetup` mode
- **AND** user submits `currentPassword`, `newPassword` and `confirmPassword`
- **AND** `currentPassword` is valid
- **THEN** system updates the user's password to `newPassword`
- **AND** system clears `isDefaultPassword` flag
- **AND** system advances `setupStep` to 'drive'

#### Scenario: Password change after setup (standard)
- **WHEN** user is NOT in `forceSetup` mode (e.g. changing password in settings)
- **AND** user submits password change request
- **THEN** system MUST require valid `currentPassword`
