# first-login-setup Specification

## Purpose

This specification defines the forced onboarding flow for new users who are logging in for the first time with a default password or have the `forceSetup` flag enabled. The setup wizard guides users through password change and storage partition configuration before allowing access to the main application.

## ADDED Requirements

### Requirement: Setup Requirement Detection

The system SHALL detect when a user requires setup completion and block access to all application features until setup is complete. A user requires setup if they have `forceSetup: true` in their user record.

#### Scenario: User with forceSetup flag is blocked

- **GIVEN** user has `forceSetup: true` in database
- **WHEN** user attempts to access any protected route
- **THEN** request is redirected to `/setup`
- **AND** user cannot access any other routes until setup is complete

#### Scenario: User without forceSetup flag proceeds normally

- **GIVEN** user has `forceSetup: false` in database
- **WHEN** user successfully authenticates
- **THEN** user proceeds to requested route
- **AND** no setup redirect occurs

---

### Requirement: Setup Status Endpoint

The system SHALL provide an endpoint to check if setup is required and which step the user is currently on.

#### Scenario: Get setup status when required

- **GIVEN** user has `forceSetup: true`
- **WHEN** GET /api/setup/status is called
- **THEN** response includes `{ "required": true, "step": "password" | "drive" | "partition" }`

#### Scenario: Get setup status when not required

- **GIVEN** user has `forceSetup: false`
- **WHEN** GET /api/setup/status is called
- **THEN** response includes `{ "required": false }`

---

### Requirement: Setup Wizard Routing

The system SHALL provide a dedicated setup wizard route that is accessible even when setup is required.

#### Scenario: Setup wizard accessible during setup

- **GIVEN** user has `forceSetup: true`
- **WHEN** user navigates to `/setup`
- **THEN** setup wizard page is displayed
- **AND** user can proceed through setup steps

#### Scenario: All other routes redirect to setup

- **GIVEN** user has `forceSetup: true`
- **WHEN** user attempts to access `/files`, `/settings`, or any other protected route
- **THEN** user is redirected to `/setup`

---

### Requirement: Setup Wizard Progress Tracking

The system SHALL track the user's progress through the setup wizard and allow resuming from the last completed step.

#### Scenario: Resume setup from password step

- **GIVEN** user has started setup but not completed password change
- **WHEN** user returns to `/setup`
- **THEN** wizard shows password step

#### Scenario: Resume setup from drive selection step

- **GIVEN** user has completed password change but not drive selection
- **WHEN** user returns to `/setup`
- **THEN** wizard shows drive selection step

#### Scenario: Resume setup from partition step

- **GIVEN** user has selected drive but not created partition
- **WHEN** user returns to `/setup`
- **THEN** wizard shows partition configuration step

---

### Requirement: Setup Completion

The system SHALL mark setup as complete only after the user has successfully changed their password and created a storage partition.

#### Scenario: Complete setup successfully

- **GIVEN** user has completed all setup steps
- **WHEN** POST /api/setup/complete is called
- **THEN** `forceSetup` is set to false in database
- **AND** user is redirected to home page
- **AND** user can now access all application features

#### Scenario: Cannot bypass setup steps

- **GIVEN** user attempts to call POST /api/setup/complete without completing all steps
- **WHEN** request is processed
- **THEN** 400 Bad Request is returned
- **AND** error message indicates incomplete steps

---

### Requirement: Setup Step Navigation

The system SHALL enforce step order - users must complete steps in sequence and cannot skip steps.

#### Scenario: Cannot skip password step

- **GIVEN** user is on password step
- **WHEN** user attempts to navigate to drive selection step
- **THEN** navigation is blocked
- **AND** user remains on password step

#### Scenario: Cannot skip drive selection

- **GIVEN** user is on drive selection step
- **WHEN** user attempts to navigate to partition step without selecting drive
- **THEN** navigation is blocked
- **AND** user remains on drive selection step

#### Scenario: Proceed to next step after completion

- **GIVEN** user has completed current step
- **WHEN** user clicks "Next" button
- **THEN** user advances to next step
- **AND** previous step is marked as completed in progress indicator

---

### Requirement: Setup Wizard UI

The system SHALL provide a user-friendly setup wizard interface with progress indicator and clear navigation.

#### Scenario: Setup wizard displays

- **GIVEN** user is required to complete setup
- **WHEN** `/setup` page loads
- **THEN** wizard displays with step title, progress indicator, and action buttons
- **AND** current step is highlighted in progress indicator
- **AND** completed steps are marked with checkmark

#### Scenario: Back button available

- **GIVEN** user is on step 2 or 3
- **WHEN** user clicks "Back" button
- **THEN** user navigates to previous step
- **AND** previously entered data is preserved

#### Scenario: Exit button disabled

- **GIVEN** user is in setup flow
- **WHEN** wizard is displayed
- **THEN** no exit or cancel button is shown
- **AND** user must complete setup to continue
