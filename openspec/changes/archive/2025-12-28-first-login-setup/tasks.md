# Tasks: First Login Setup

## 1. Backend: User Model Update

- [x] 1.1 Add `MustChangePassword` field to User model
- [x] 1.2 Run database migration
- [x] 1.3 Set `MustChangePassword: true` for default admin

---

## 2. Backend: Password Validation

- [x] 2.1 Create `ValidatePasswordStrength` function
- [x] 2.2 Requirements: 8 chars, uppercase, number, symbol
- [x] 2.3 Update signup to use new validation

---

## 3. Backend: Change Password Endpoint

- [x] 3.1 Create `routes/api/change-password.post.go`
- [x] 3.2 Accept: current password, new password, new username (optional)
- [x] 3.3 Validate new password strength
- [x] 3.4 Update user and set `MustChangePassword: false`
- [x] 3.5 Register route in router.go

---

## 4. Backend: Update Login Response

- [x] 4.1 Add `mustChangePassword` to AuthResponse
- [x] 4.2 Return flag from login endpoint

---

## 5. Frontend: Change Password Modal

- [x] 5.1 Create `ChangePasswordModal` component
- [x] 5.2 Form: current password, new password, confirm, username (optional)
- [x] 5.3 Real-time password strength indicator
- [x] 5.4 Submit to `/api/change-password`

---

## 6. Frontend: Auth Flow Update

- [x] 6.1 Update AuthContext to handle `mustChangePassword`
- [x] 6.2 Show modal after login if flag is true
- [x] 6.3 Block app access until password changed

---

## 7. Verification

- [x] 7.1 Go build passes
- [x] 7.2 Frontend build passes
- [x] 7.3 Test login with default admin shows modal
- [x] 7.4 Test strong password accepted
