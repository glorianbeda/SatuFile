# Change: File-Based Backend Routing

## Why
Simplify route management by using file-based conventions instead of manual router registration. Makes adding new endpoints intuitive - just create a file.

## What Changes

### Pattern
```
routes/
├── api/
│   ├── login.post.go       → POST /api/login
│   ├── signup.post.go      → POST /api/signup
│   ├── renew.post.go       → POST /api/renew
│   ├── me.get.go           → GET /api/me
│   ├── info.get.go         → GET /api/info
│   └── users/
│       ├── index.get.go    → GET /api/users
│       ├── [id].get.go     → GET /api/users/:id
│       └── [id].delete.go  → DELETE /api/users/:id
└── health.get.go           → GET /health
```

### File Naming Convention
- `{name}.{method}.go` - method: get, post, put, patch, delete
- `index.{method}.go` - maps to parent directory path
- `[param].{method}.go` - dynamic parameter

### Handler Interface
```go
// routes/api/login.post.go
package routes

func Handler(w http.ResponseWriter, r *http.Request) {
    // ...
}
```

## Impact
- Affected code: `http/http.go`, new `routes/` directory
- Breaking: Yes - rewrites router initialization
- Backward compatible: Existing endpoints kept

## Technical Notes

> [!IMPORTANT]
> Go doesn't have runtime file-based routing like Next.js. We'll use **code generation** at build time to scan the routes/ directory and generate a router.go file.

### Approach: Build-time Code Generation
1. Create `cmd/gen-routes/main.go` that scans `routes/` dir
2. Generate `routes/router.go` with all route registrations
3. Add `go generate` command to Taskfile

### Alternative: Manual Registration with Convention
Simpler approach - keep handlers in routes/ with naming convention, but manually import in router.go with helper macros.
