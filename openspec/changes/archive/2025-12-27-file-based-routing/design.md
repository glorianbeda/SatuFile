# Design: File-Based Backend Routing

## Context
User wants a simpler way to add routes without editing multiple files. File-based routing with method in filename.

## Goals / Non-Goals

### Goals
- Add routes by creating files
- Method in filename (.get.go, .post.go)
- Dynamic parameters with [param] syntax
- Clean handler interface

### Non-Goals
- Full Next.js-like runtime routing (Go limitation)
- Automatic middleware per-folder (future)

## Architecture

### Approach: Code Generation

Since Go is compiled, we'll use **go generate** to scan the `routes/` directory and create a `router.go` file.

```
┌──────────────────────────────────────────────────────┐
│ routes/                                              │
│   api/login.post.go                                  │
│   api/me.get.go                                      │
│   health.get.go                                      │
└──────────────────────────────────────────────────────┘
                        │
                        ▼ go generate
┌──────────────────────────────────────────────────────┐
│ routes/router.go (generated)                         │
│   r.HandleFunc("/api/login", api.LoginPost).POST()   │
│   r.HandleFunc("/api/me", api.MeGet).GET()           │
│   r.HandleFunc("/health", HealthGet).GET()           │
└──────────────────────────────────────────────────────┘
```

### File Structure
```
routes/
├── api/
│   ├── login.post.go      # exports LoginPost handler
│   ├── signup.post.go     # exports SignupPost handler
│   ├── renew.post.go      # exports RenewPost handler
│   ├── me.get.go          # exports MeGet handler
│   ├── info.get.go        # exports InfoGet handler
│   └── users/
│       ├── list.get.go    # exports ListGet → GET /api/users
│       └── by_id.get.go   # exports ByIdGet(id) → GET /api/users/{id}
├── health.get.go          # exports HealthGet handler
└── router.go              # GENERATED - don't edit
```

### Handler Convention
```go
// routes/api/login.post.go
package api

import "net/http"

// LoginPost handles POST /api/login
func LoginPost(w http.ResponseWriter, r *http.Request) {
    // handler code
}
```

### Generator Script
```go
// cmd/gen-routes/main.go
// Scans routes/ and generates router.go
```

## Decisions

### 1. Package Structure
**Decision:** Each subdirectory is a Go package
**Reason:** Go requires separate packages per directory

### 2. Handler Naming
**Decision:** PascalCase: `{Name}{Method}` (e.g., LoginPost, MeGet)
**Reason:** Go export convention, clear method indication

### 3. Dynamic Routes
**Decision:** Use `by_{param}.{method}.go` instead of `[param]`
**Reason:** `[` is problematic in filenames on some systems

## File Map

| Current File | New Location |
|--------------|--------------|
| http/auth.go (Login) | routes/api/login.post.go |
| http/auth.go (Signup) | routes/api/signup.post.go |
| http/auth.go (Renew) | routes/api/renew.post.go |
| http/auth.go (Me) | routes/api/me.get.go |
| http/http.go (info) | routes/api/info.get.go |
| http/http.go (health) | routes/health.get.go |

## Risks
| Risk | Mitigation |
|------|------------|
| Generator complexity | Keep it simple, well-tested |
| IDE navigation | Clear naming convention |
| Forgot to regenerate | Add to build process |
