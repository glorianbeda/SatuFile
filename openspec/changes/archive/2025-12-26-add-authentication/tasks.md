# Tasks: Add Authentication

## 1. Backend: Database Setup

- [x] 1.1 Add GORM dependency to go.mod
- [x] 1.2 Create database connection config
- [x] 1.3 Create User model in `users/model.go`
- [x] 1.4 Setup auto-migration
- [x] 1.5 Create default admin user seeder

---

## 2. Backend: User Repository

- [x] 2.1 Create `users/repository.go` with CRUD methods
- [x] 2.2 Implement password hashing in `users/password.go`
- [x] 2.3 Add GetByUsername, GetByID methods
- [x] 2.4 Add Create, Update, Delete methods

---

## 3. Backend: JWT Auth

- [x] 3.1 Add jwt-go dependency
- [x] 3.2 Create `auth/jwt.go` for token generation
- [x] 3.3 Create `auth/middleware.go` with withUser, withAdmin
- [x] 3.4 Implement token refresh logic

---

## 4. Backend: Auth Handlers

- [x] 4.1 Create `http/auth.go` with login handler
- [x] 4.2 Add signup handler
- [x] 4.3 Add renew handler
- [x] 4.4 Add /api/me endpoint
- [x] 4.5 Register routes in http.go

---

## 5. Frontend: Auth Context

- [x] 5.1 Create `contexts/AuthContext.tsx`
- [x] 5.2 Implement login/logout methods
- [x] 5.3 Add token persistence to localStorage
- [x] 5.4 Create useAuth hook

---

## 6. Frontend: Auth Pages

- [x] 6.1 Create LoginPage component
- [x] 6.2 Create SignupPage component
- [x] 6.3 Create LoginForm with validation
- [x] 6.4 Create SignupForm with validation
- [x] 6.5 Add routes in App.tsx

---

## 7. Frontend: Route Protection

- [x] 7.1 Create ProtectedRoute component
- [x] 7.2 Update API client with token interceptor
- [x] 7.3 Add redirect on 401 responses
- [x] 7.4 Update Layout to show user info

---

## 8. Verification

- [x] 8.1 Go build passes successfully (20MB binary)
- [x] 8.2 Frontend build passes (514KB bundle)
- [x] 8.3 Default admin created: admin/admin123!
- [x] 8.4 Login/Signup pages render
