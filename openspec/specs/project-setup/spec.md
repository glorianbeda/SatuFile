# project-setup Specification

## Purpose
TBD - created by archiving change setup-project-scaffold. Update Purpose after archive.
## Requirements
### Requirement: Go Backend Structure
The system SHALL have a Go backend following filebrowser patterns with:
- Entry point in `main.go`
- CLI commands in `cmd/` package
- HTTP handlers in `http/` package
- Configuration in `settings/` package
- Storage abstraction in `storage/` package

#### Scenario: Backend builds successfully
- **GIVEN** the Go project is set up
- **WHEN** `go build` is executed
- **THEN** a binary is produced without errors

#### Scenario: Health endpoint responds
- **GIVEN** the server is running
- **WHEN** GET `/health` is called
- **THEN** a 200 OK response is returned

---

### Requirement: React Frontend Structure
The system SHALL have a React frontend with TypeScript and Material UI including:
- Vite as build tool
- Reusable components in `components/common/`
- Feature modules in `features/`
- Custom hooks in `hooks/`
- React Context in `contexts/`
- API client in `api/`
- TypeScript types in `types/`

#### Scenario: Frontend builds successfully
- **GIVEN** the React project is set up
- **WHEN** `pnpm build` is executed in `frontend/`
- **THEN** production bundle is generated in `frontend/dist/`

#### Scenario: Development server starts
- **GIVEN** dependencies are installed
- **WHEN** `pnpm dev` is executed in `frontend/`
- **THEN** the dev server starts and React app is accessible

---

### Requirement: Reusable Component Pattern
Frontend components SHALL follow a reusable pattern where:
- Common UI elements are in `components/common/`
- Components accept configuration via props
- TypeScript interfaces define component props
- Components are exportable for use across features

#### Scenario: Button component is reusable
- **GIVEN** a Button component exists in `components/common/`
- **WHEN** Button is imported into a feature
- **THEN** it can be used with custom props (variant, color, onClick)

---

### Requirement: Single Binary Deployment
The system SHALL support deployment as a single Go binary that:
- Embeds the frontend build output
- Serves static files at configured path
- Falls back to index.html for SPA routing

#### Scenario: Embedded frontend is served
- **GIVEN** frontend is built and embedded
- **WHEN** GET `/` is called on the running server
- **THEN** the React app HTML is returned

