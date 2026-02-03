## MODIFIED Requirements

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
