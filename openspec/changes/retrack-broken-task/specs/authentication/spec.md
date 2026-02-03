## MODIFIED Requirements

### Requirement: Protected Routes
The system SHALL protect API routes requiring authentication with middleware that validates JWT tokens. It SHALL explicitly whitelist setup routes (`/api/setup/*`) to be accessible during the initial setup phase (`forceSetup=true`), ensuring users can complete setup without premature authentication failures.

#### Scenario: Unauthenticated request blocked
- **GIVEN** request has no token
- **WHEN** accessing protected route
- **THEN** 401 Unauthorized is returned

#### Scenario: Admin route protected
- **GIVEN** user is not admin
- **WHEN** accessing admin-only route
- **THEN** 403 Forbidden is returned

#### Scenario: Setup route allowed in setup mode
- **GIVEN** system is in `forceSetup=true` mode
- **WHEN** accessing `/api/setup/password` or other setup routes
- **THEN** request is allowed to proceed
- **AND** 401 Unauthorized is NOT returned
