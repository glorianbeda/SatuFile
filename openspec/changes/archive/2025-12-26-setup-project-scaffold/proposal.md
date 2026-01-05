# Change: Setup Project Scaffold

## Why
SatuFile needs a foundational project structure for both backend (Go) and frontend (React + MUI). This scaffold establishes the patterns and directory structure following filebrowser-master as the reference implementation, enabling future feature development.

## What Changes
- **NEW** Go backend with Gorilla Mux routing, following filebrowser patterns
- **NEW** React frontend with TypeScript, Vite, and Material UI
- **NEW** Unified build process (Go serves embedded React frontend)
- **NEW** Basic project configuration (go.mod, package.json, vite.config)
- **NEW** Core directory structure for extensibility

## Impact
- Affected specs: `project-setup` (new capability)
- Affected code: Creates root-level project structure
- Reference: `/home/glo/DokumenAne/filebrowser-master`

## Scope

### Backend (Go)
Following filebrowser's structure:
```
├── main.go                 # Entry point → cmd.Execute()
├── cmd/                    # CLI commands (cobra)
│   └── root.go
├── http/                   # HTTP handlers (gorilla/mux)
│   └── http.go
├── settings/               # App configuration
├── storage/                # Database abstraction
└── go.mod
```

### Frontend (React + MUI)
Converting Vue patterns to React:
```
frontend/
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Root component
│   ├── api/               # API client
│   ├── components/        # Reusable MUI components
│   │   └── common/        # Button, Card, etc.
│   ├── features/          # Feature modules
│   ├── hooks/             # Custom hooks
│   ├── contexts/          # React Context
│   ├── types/             # TypeScript types
│   └── utils/             # Helpers
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Out of Scope
- Authentication implementation
- File operations
- User management
- Database schema
