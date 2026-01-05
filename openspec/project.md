# Project Context

## Purpose
SatuFile is a cloud drive web application inspired by [filebrowser](https://github.com/filebrowser/filebrowser). It provides a file managing interface for uploading, downloading, previewing, and organizing files through a modern web interface.

**Reference Codebase:** `/home/glo/DokumenAne/filebrowser-master`

> [!IMPORTANT]
> Always reference filebrowser-master when implementing features. Use the `/filebrowser-reference` workflow.

## Tech Stack

### Backend
- **Language:** Go 1.24+
- **Router:** Gorilla Mux
- **Database:** SQLite with GORM ORM (embedded)
- **Auth:** JWT tokens (golang-jwt/jwt/v5)
- **CLI Framework:** Cobra + Viper for configuration
- **File Operations:** Standard Go libs + afero

### Frontend
- **Framework:** React 19+ with TypeScript 5.9+
- **UI Library:** Material UI (MUI) v7+ with TailwindCSS v4+
- **State:** React Context
- **Routing:** React Router v7+
- **Build:** Vite 7+
- **HTTP Client:** Axios
- **Icons:** @mui/icons-material
- **i18n:** Custom implementation (English, Indonesian)

## Project Conventions

### Code Style

**Go Backend:**
- Follow standard Go formatting (`gofmt`)
- Use meaningful package names
- Error handling: return errors, don't panic
- Use context for cancellation/timeouts

**React Frontend:**
- Functional components only (no class components)
- TypeScript strict mode
- Use hooks for all state/effects
- Props interface naming: `ComponentNameProps`

### Component Guidelines
- **Reusability First**: Every component should be designed for reuse
- **Atomic Design**: Build small → compose into larger components
- **Props over Hardcoding**: Make components configurable via props
- **Separation of Concerns**: Logic hooks vs presentation components
- **TypeScript Strict**: Always type props, state, and API responses

```
src/
├── components/        # Reusable UI components
│   ├── common/        # Buttons, Inputs, Cards, Dialogs, etc.
│   ├── layout/        # Header, StoragePanel, Layout
│   └── files/         # FileGrid, FileRow, FilePreview, Modals, etc.
├── features/          # Feature-specific components
│   ├── auth/          # Login page, ProtectedRoute, ChangePasswordModal
│   ├── files/         # HomePage
│   ├── settings/      # SettingsPage (Profile, Security, Shares)
│   └── shares/        # PublicSharePage
├── hooks/             # Reusable custom hooks
├── contexts/          # React Context providers (Auth, Theme, Toast)
├── api/               # API client, types, and hooks
├── i18n/              # Internationalization (en, id locales)
├── types/             # Shared TypeScript types
├── utils/             # Helper functions
└── assets/            # Static assets
```

### Architecture Patterns

**Backend (following filebrowser):**
- Route handlers in `/routes/` organized by endpoint type
- Business logic in dedicated packages (`auth/`, `users/`, `files/`, `storage/`, `share/`, `settings/`)
- Middleware chain for auth (JWT), logging
- GORM for database operations
- Storage abstraction layer
- Cobra CLI for command-line interface

**Frontend:**
- Feature-based folder structure under `features/`
- Shared UI components in `components/`
- Context providers for global state (Auth, Theme, Toast)
- Centralized API client with typed responses
- Internationalization support (English, Indonesian)
- TailwindCSS for styling with MUI components

### Testing Strategy
- **Go Backend:** Table-driven tests with Go's testing package (not yet implemented)
- **React Frontend:** Testing with React Testing Library (not yet implemented)
- **E2E:** Manual testing currently (Playwright planned)

### Git Workflow
- Feature branches from `main`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- PR required for merge to main

## Domain Context

### Core Concepts (from filebrowser)
- **User**: Account with permissions and scope
- **Resource**: File or directory
- **Permission**: What actions a user can perform
- **Scope**: Root directory a user can access
- **Share**: Public/private link to a resource

### Key Features Implemented
1. ✅ File browsing and navigation (list/grid views)
2. ✅ File upload/download (with progress tracking)
3. ✅ File preview (images, videos, documents)
4. ✅ User authentication and management (single-user JWT)
5. ✅ File sharing with links
6. ✅ Search functionality
7. ✅ Multi-language support (English & Indonesian)
8. ✅ Password change functionality
9. ✅ Protected core folders (Documents, Pictures, Videos, Audio, Downloads)

### Key Features to Implement
1. Multi-user support (currently single-user deployment)
2. File versioning
3. Advanced search with filters
4. Bulk operations (select multiple files)
5. Drag and drop file organization
6. Thumbnail generation for videos
7. Dark/light theme toggle

## Important Constraints
- Must work as a single binary (Go backend serves React frontend)
- No external database required (embedded SQLite)
- Cross-platform support (Linux, Windows, macOS)
- Progressive enhancement for mobile
- Single-user deployment (admin account only)
- Protected folders cannot be deleted

## External Dependencies

### Backend
- SQLite + GORM for database storage
- golang-jwt/jwt/v5 for JWT authentication
- Gorilla Mux for HTTP routing
- Cobra + Viper for CLI and configuration
- golang.org/x/crypto for password hashing

### Frontend
- Material UI (MUI) v7+ for components
- TailwindCSS v4+ for styling
- React Router v7+ for navigation
- Axios for API calls
- @mui/icons-material for icons
- @mui/x-data-grid for data grids

## Deployment

### Docker Compose
- Single service deployment with data volume mount
- Environment variables for configuration
- Default port: 8080

### Standalone Binary
- Compiled Go binary embeds React frontend
- CLI flags for configuration (-r root, -p port, -a address)
- Default credentials: admin / Admin123! (prompted to change on first login)

## Development Workflow

### Backend Development
```bash
# Run backend with hot reload
go run main.go

# Build binary
go build -o satufile

# Run with custom root
./satufile -r ./data -p 8080
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev        # Development server
npm run build      # Production build
```

### Database
- SQLite database at `data/satufile.db`
- GORM migrations on startup
- Embedded in data directory

## Known Issues & Limitations
- Single-user only (no multi-user support yet)
- No file versioning system
- Limited thumbnail support (images only)
- No bulk file operations
- No drag and drop for reorganizing files
