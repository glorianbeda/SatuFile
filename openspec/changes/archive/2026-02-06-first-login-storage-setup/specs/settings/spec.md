# settings Delta Specification

## Purpose

This delta specification modifies the settings requirements to integrate setup completion status and storage information.

## MODIFIED Requirements

### Requirement: Profile Preferences

The system SHALL allow users to update their profile preferences. **The system SHALL display setup completion status and storage allocation information in the settings panel.**

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

#### Scenario: Display setup status in settings

- **GIVEN** user is on settings page
- **WHEN** page loads
- **THEN** setup completion status is displayed
- **AND** if setup is incomplete, a link to complete setup is shown

#### Scenario: Display storage information in settings

- **GIVEN** user has completed setup and has storage allocated
- **WHEN** user views settings
- **THEN** storage allocation information is displayed:
  - Storage path
  - Allocated size
  - Used space
  - Available space
  - Visual usage bar

---

### Requirement: Password Change

The system SHALL allow users to change their password from settings. **The password change endpoint clears the `isDefaultPassword` flag when called.**

#### Scenario: Successful password change

- **GIVEN** user enters valid current and new password
- **WHEN** user submits the form
- **THEN** password is updated
- **AND** `isDefaultPassword` flag is set to false
- **AND** success toast is shown

#### Scenario: Weak password rejected

- **GIVEN** user enters password not meeting requirements
- **WHEN** user tries to submit
- **THEN** validation errors are shown
- **AND** form is not submitted

---

## ADDED Requirements

### Requirement: Storage Information Settings

The system SHALL provide detailed storage information in settings and allow users to view their current usage.

#### Scenario: View storage details

- **GIVEN** user has allocated storage
- **WHEN** user views storage section in settings
- **THEN** following information is displayed:
  - Total allocated size (e.g., "100 GB")
  - Used space (e.g., "45 GB")
  - Available space (e.g., "55 GB")
  - Usage percentage (e.g., "45%")
  - Storage path (e.g., "/mnt/data/cloud-storage/user/")
  - Visual progress bar showing usage

#### Scenario: Storage warning display

- **GIVEN** user has used 90% or more of allocated storage
- **WHEN** user views settings
- **THEN** warning message is displayed: "Storage nearly full"
- **AND** warning is highlighted in orange or red

#### Scenario: No storage allocated message

- **GIVEN** user has not completed setup
- **WHEN** user views settings
- **THEN** message is displayed: "Setup not completed"
- **AND** button/link to complete setup is shown

---

### Requirement: Settings API Extension

The settings API endpoint SHALL return additional fields including setup status and storage information.

#### Scenario: Get settings with setup status

- **GIVEN** user requests GET /api/settings
- **WHEN** response is returned
- **THEN** response includes `setupCompleted: true | false`
- **AND** if storage is allocated, includes `storage` object with:
  - `path`: Storage directory path
  - `allocatedGb`: Total allocated gigabytes
  - `usedGb`: Used gigabytes
  - `availableGb`: Available gigabytes
  - `usagePercent`: Usage percentage

#### Scenario: Get settings without storage

- **GIVEN** user has not completed setup
- **WHEN** response is returned
- **THEN** `setupCompleted` is false
- **AND** `storage` is null or omitted
