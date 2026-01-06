## ADDED Requirements

### Requirement: Password-Protected Shares

The system SHALL allow users to protect share links with passwords.

#### Scenario: Create password-protected share

- **GIVEN** user creates a new share link
- **WHEN** user enables password protection
- **AND** user enters a password
- **THEN** share link requires password to access
- **AND** password is hashed and stored securely

#### Scenario: Access password-protected share

- **GIVEN** user opens a password-protected share link
- **WHEN** page loads
- **THEN** password prompt is displayed
- **AND** content is hidden until correct password is entered

#### Scenario: Wrong password attempt

- **GIVEN** user opens a password-protected share link
- **WHEN** user enters incorrect password
- **THEN** error message is displayed
- **AND** content remains hidden
- **AND** user can try again

#### Scenario: Remove password from share

- **GIVEN** user has a password-protected share
- **WHEN** user disables password protection
- **THEN** share link becomes publicly accessible
- **AND** password is removed from database

---

### Requirement: Share Analytics

The system SHALL track and display share link usage analytics.

#### Scenario: Track share views

- **GIVEN** share link is accessed
- **WHEN** user views shared content
- **THEN** view count is incremented
- **AND** access time is logged
- **AND** IP address (anonymized) is stored

#### Scenario: Track share downloads

- **GIVEN** user downloads a file from share
- **WHEN** download completes
- **THEN** download count is incremented
- **AND** access log is updated

#### Scenario: View share analytics in UI

- **GIVEN** user has created share links
- **WHEN** user views Settings > Shares page
- **THEN** each share shows:
  - Total views count
  - Total downloads count
  - Last accessed time
  - Unique visitors count

#### Scenario: View detailed access log

- **GIVEN** user clicks "View Details" on a share
- **WHEN** details modal opens
- **THEN** access log table is displayed showing:
  - Timestamp
  - Action (view/download)
  - Anonymized IP
  - User agent/browser

---

### Requirement: QR Code for Shares

The system SHALL generate QR codes for share links.

#### Scenario: Generate QR code

- **GIVEN** user creates a share link
- **WHEN** share dialog opens
- **THEN** QR code is automatically generated
- **AND** QR code is displayed in the dialog

#### Scenario: Download QR code

- **GIVEN** QR code is displayed
- **WHEN** user clicks "Download QR"
- **THEN** QR code is downloaded as PNG image
- **AND** filename includes share name and date

#### Scenario: Scan QR code on mobile

- **GIVEN** user has QR code image
- **WHEN** user scans with mobile device
- **THEN** share link opens in mobile browser
- **AND** content is accessible (with password if protected)

---

### Requirement: Expiry Notifications

The system SHALL send notifications before share links expire.

#### Scenario: Enable expiry notification

- **GIVEN** user creates a share link
- **WHEN** user enables "Notify before expiry"
- **AND** selects notification timing (1 day, 3 days, 1 week)
- **THEN** notification settings are saved

#### Scenario: Send expiry warning email

- **GIVEN** share link has notification enabled
- **AND** current time is within notification window
- **WHEN** background job runs
- **THEN** email is sent to user
- **AND** email includes:
  - Share link URL
  - Shared item name
  - Expiration time
  - Option to extend expiry

#### Scenario: No email if SMTP not configured

- **GIVEN** user enables expiry notification
- **AND** SMTP is not configured
- **WHEN** notification time arrives
- **THEN** in-app notification is shown instead
- **AND** user is warned about missing email config

#### Scenario: Extend expiry from notification

- **GIVEN** user receives expiry notification email
- **WHEN** user clicks "Extend for 7 days" link
- **THEN** share link expiry is extended
- **AND** confirmation is shown
- **AND** new expiry notification is scheduled

---
