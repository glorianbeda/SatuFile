# project-setup Specification

## Purpose
This specification defines the core structure and standards for the project, including backend organization, frontend architecture with standardized import aliases, and deployment patterns.
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
- **Standardized internal imports using the `@` alias**
- **Clean codebase free of unused imports and local declarations**

#### Scenario: Frontend builds successfully
- **GIVEN** the React project is set up
- **WHEN** `npm run build` is executed in `frontend/`
- **THEN** production bundle is generated in `frontend/dist/`

#### Scenario: Development server starts
- **GIVEN** dependencies are installed
- **WHEN** `npm run dev` is executed in `frontend/`
- **THEN** the dev server starts and React app is accessible

#### Scenario: Internal imports use aliases
- **GIVEN** a file in `frontend/src` needs to import another file in `frontend/src`
- **WHEN** the import is written
- **THEN** it SHALL use the `@/` prefix (e.g., `@/components/...`)
- **AND** SHALL NOT use relative paths (e.g., `../../components/...`)

#### Scenario: Codebase is clean
- **GIVEN** the frontend codebase
- **WHEN** checked for unused imports or variables
- **THEN** no unused declarations SHALL be present

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

