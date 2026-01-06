## MODIFIED Requirements
### Requirement: Profile Preferences

The system SHALL allow users to update their profile preferences, including language selection that persists across sessions and devices.

#### Scenario: Change language (with persistence)

- **GIVEN** user is logged in
- **WHEN** user changes language to Indonesian in settings
- **THEN** preference is saved to database
- **AND** UI language changes immediately
- **AND** language preference persists after logout/login
- **AND** language preference persists across different devices

#### Scenario: Language change validates against supported languages

- **GIVEN** user is on settings page
- **WHEN** API receives invalid language code
- **THEN** validation error is returned
- **AND** error message indicates supported languages (en, id)
- **AND** language is not changed

#### Scenario: Initialize language from user profile

- **GIVEN** user logs in with saved locale 'id'
- **WHEN** user authentication completes
- **THEN** UI language is set to user's saved locale
- **AND** preference is also stored in localStorage

#### Scenario: Fallback language for new users

- **GIVEN** new user account is created
- **WHEN** user logs in for first time
- **THEN** language defaults to 'id' (Indonesian)
- **AND** default can be changed in settings

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

## ADDED Requirements
### Requirement: Language Information API

The system SHALL provide information about supported languages via the API.

#### Scenario: Get supported languages

- **GIVEN** user requests `/api/info`
- **WHEN** API responds
- **THEN** response includes `supportedLanguages` array
- **AND** each language includes code (e.g., 'en') and name (e.g., 'English')
- **AND** languages include at least 'en' and 'id'

---

### Requirement: Backend Language Validation

The system SHALL validate language codes on the backend before saving to database.

#### Scenario: Valid locale accepted

- **GIVEN** user sends PUT /api/me with locale='en'
- **WHEN** request is processed
- **THEN** locale is validated successfully
- **AND** user's locale is updated in database

#### Scenario: Invalid locale rejected

- **GIVEN** user sends PUT /api/me with locale='fr'
- **WHEN** request is processed
- **THEN** validation fails
- **AND** 400 Bad Request is returned
- **AND** error message indicates valid language codes
- **AND** locale is not changed in database
