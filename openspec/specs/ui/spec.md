# ui Specification

## Purpose
TBD - created by archiving change responsive-header-toast. Update Purpose after archive.
## Requirements
### Requirement: Toast Notifications

The system SHALL display toast notifications for user feedback.

#### Scenario: Success toast on password change

- **GIVEN** user changes password successfully
- **WHEN** API returns success
- **THEN** green toast appears with success message
- **AND** toast auto-dismisses after 3 seconds

#### Scenario: Error toast on API failure

- **GIVEN** any API call fails
- **WHEN** error response is received
- **THEN** red toast appears with error message

---

### Requirement: Responsive Header

The header SHALL adapt to different screen sizes.

#### Scenario: Desktop view (>1024px)

- **GIVEN** screen width > 1024px
- **WHEN** header is displayed
- **THEN** full search bar is visible
- **AND** buttons show text and icons

#### Scenario: Tablet view (768-1024px)

- **GIVEN** screen width between 768-1024px
- **WHEN** header is displayed
- **THEN** search bar is compact
- **AND** buttons show icons only

#### Scenario: Mobile view (<768px)

- **GIVEN** screen width < 768px
- **WHEN** header is displayed
- **THEN** search becomes icon button
- **AND** actions collapse to menu

