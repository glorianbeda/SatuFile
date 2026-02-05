# project-setup Specification

## MODIFIED Requirements

### Requirement: Single Binary Deployment
The system SHALL support deployment as a single Go binary managed by PM2 that:
- Embeds the frontend build output OR serves built frontend files
- Serves static files at configured path
- Falls back to index.html for SPA routing
- Is managed by PM2 for process supervision

#### Scenario: Embedded frontend is served
- **GIVEN** frontend is built and embedded
- **WHEN** GET `/` is called on the running server
- **THEN** the React app HTML is returned

#### Scenario: Application is managed by PM2
- **GIVEN** the application is deployed
- **WHEN** PM2 is running the application
- **THEN** process supervision SHALL be active
- **AND** automatic restart SHALL occur on crash
- **AND** logs SHALL be accessible via PM2

#### Scenario: PM2 manages binary execution
- **GIVEN** ecosystem.config.js is configured
- **WHEN** PM2 starts the application
- **THEN** the Go binary SHALL be executed with proper environment variables
- **AND** the application SHALL bind to configured port

## REMOVED Requirements

### Requirement: Docker Deployment Support
**Reason**: Docker deployment is no longer supported. PM2 native deployment is the primary deployment method.
**Migration**: Use PM2 with ecosystem.config.js for deployment. Install PM2 globally with `npm install -g pm2` and start with `pm2 start ecosystem.config.js`.
