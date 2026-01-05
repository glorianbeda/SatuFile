# Design: Add Authentication

## Context
Implementing secure authentication for SatuFile with JWT tokens. Following filebrowser patterns but using GORM for database access since Prisma Go is deprecated.

## Goals / Non-Goals

### Goals
- Secure login/signup with JWT
- Password hashing with bcrypt
- Token refresh mechanism
- Protected API routes
- Persistent user storage

### Non-Goals
- OAuth/social login (future)
- 2FA (future)
- Password reset via email (future)

## Architecture

### Authentication Flow
```
┌─────────┐      POST /api/login       ┌─────────┐
│ Client  │ ──────────────────────────>│ Backend │
│ (React) │    {username, password}    │  (Go)   │
└────┬────┘                            └────┬────┘
     │                                      │
     │                                      ▼
     │                              ┌───────────────┐
     │                              │ Validate creds│
     │                              │ Hash compare  │
     │                              └───────┬───────┘
     │                                      │
     │       200 + JWT token               ▼
     │<─────────────────────────── Generate JWT
     │
     ▼
┌─────────────────┐
│ Store token in  │
│ localStorage    │
└─────────────────┘
```

### Data Models

```go
// User model (GORM)
type User struct {
    ID        uint      `gorm:"primaryKey"`
    Username  string    `gorm:"uniqueIndex;not null"`
    Password  string    `gorm:"not null"` // bcrypt hash
    Email     string    `gorm:"uniqueIndex"`
    Scope     string    // File access scope
    Locale    string    `gorm:"default:'en'"`
    IsAdmin   bool      `gorm:"default:false"`
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

### JWT Claims
```go
type AuthClaims struct {
    UserID   uint   `json:"userId"`
    Username string `json:"username"`
    IsAdmin  bool   `json:"isAdmin"`
    jwt.RegisteredClaims
}
```

## Decisions

### 1. ORM: GORM over Prisma
**Decision:** Use GORM for database access
**Reason:** Prisma Go client is deprecated (no v7+ support). GORM is:
- Most popular Go ORM
- Actively maintained
- Full feature support

### 2. Database: SQLite default
**Decision:** SQLite for development, configurable for production
**Reason:** Zero-config setup, easy migration to MySQL/PostgreSQL

### 3. Token Storage
**Decision:** localStorage (frontend), HTTP-only cookie option
**Reason:** Simple implementation, XSS mitigated by CSP

### 4. Password Requirements
**Decision:** Minimum 8 characters (configurable)
**Reason:** Balance security and usability

## API Endpoints

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | /api/login | `{username, password}` | JWT token |
| POST | /api/signup | `{username, password, email?}` | 200 OK |
| POST | /api/renew | (with valid token) | New JWT token |
| GET | /api/me | (with valid token) | User info |

## File Structure

### Backend
```
auth/
├── auth.go         # Auth interface
├── jwt.go          # Token generation/validation
└── middleware.go   # withUser, withAdmin

users/
├── model.go        # User struct (GORM)
├── repository.go   # CRUD operations
└── password.go     # Hash/verify helpers
```

### Frontend
```
features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── pages/
│   ├── LoginPage.tsx
│   └── SignupPage.tsx
├── hooks/
│   └── useAuth.ts
└── context/
    └── AuthContext.tsx
```

## Risks / Trade-offs
| Risk | Mitigation |
|------|------------|
| JWT in localStorage | CSP headers, short expiry |
| Plain password transit | HTTPS required in production |
| GORM learning curve | Well-documented, follows patterns |
