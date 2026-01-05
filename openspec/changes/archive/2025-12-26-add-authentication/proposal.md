# Change: Add Authentication

## Why
SatuFile needs user authentication for secure file access. This implements full-stack login/signup following filebrowser patterns with JWT tokens.

## What Changes

### Backend (Go)
- **NEW** User model with GORM ORM (MySQL/PostgreSQL/SQLite)
- **NEW** Password hashing with bcrypt
- **NEW** JWT token generation and validation
- **NEW** Auth middleware for protected routes
- **NEW** Endpoints: `POST /api/login`, `POST /api/signup`, `POST /api/renew`

### Frontend (React)
- **NEW** Login page with form
- **NEW** Signup page with form
- **NEW** Auth context for state management
- **NEW** Protected route wrapper
- **NEW** API client auth interceptors

## Impact
- Affected specs: `authentication` (new capability)
- Affected code: Backend (`auth/`, `users/`), Frontend (`features/auth/`)
- Database: User table schema

## Technical Notes

> [!WARNING]
> **Prisma Go Deprecated**: Prisma Go client is deprecated and won't support Prisma v7+. Using **GORM** instead - the most popular Go ORM with full feature support.

### ORM Choice: GORM
- Most popular Go ORM (30k+ stars)
- Supports MySQL, PostgreSQL, SQLite
- Auto migrations
- Type-safe queries
- Active maintenance

### Reference
Following `filebrowser-master/http/auth.go` patterns:
- JWT with HS256 signing
- Token extraction from header/cookie
- bcrypt password hashing
- User permissions struct
