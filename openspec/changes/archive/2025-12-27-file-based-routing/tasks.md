# Tasks: File-Based Backend Routing

## 1. Create Route Generator

- [x] 1.1 Create `cmd/gen-routes/main.go` script
- [x] 1.2 Parse routes/ directory structure
- [x] 1.3 Generate router.go with all routes

---

## 2. Create Route Handlers

- [x] 2.1 Create routes/api/ package structure
- [x] 2.2 Migrate login handler → routes/api/login.post.go
- [x] 2.3 Migrate signup handler → routes/api/signup.post.go
- [x] 2.4 Migrate renew handler → routes/api/renew.post.go
- [x] 2.5 Migrate me handler → routes/api/me.get.go
- [x] 2.6 Migrate info handler → routes/api/info.get.go
- [x] 2.7 Create routes/health.get.go

---

## 3. Update Build Process

- [x] 3.1 Create routes/router.go with all route registration
- [x] 3.2 Update http/http.go to use routes.RegisterRoutes
- [x] 3.3 Remove old http/auth.go

---

## 4. Verification

- [x] 4.1 Go build passes
- [x] 4.2 All handlers in routes/ directory
- [x] 4.3 Old auth.go removed
