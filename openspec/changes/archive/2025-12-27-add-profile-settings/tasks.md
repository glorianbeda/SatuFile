# Tasks: Add Profile Settings Menu

## 1. Backend API

- [x] 1.1 Create `PUT /api/me` endpoint for updating user preferences
- [x] 1.2 Update User model with HideDotfiles, SingleClick fields
- [x] 1.3 Add validation for password change API

---

## 2. Frontend: Settings Page

- [x] 2.1 Create `features/settings/` feature folder
- [x] 2.2 Create `SettingsPage.tsx` with tabs (Profil, Keamanan)
- [x] 2.3 Route to /settings
- [x] 2.4 Header navigation to /settings

---

## 3. Profile Settings Tab

- [x] 3.1 Create `ProfileSettings.tsx` component
- [x] 3.2 Language selector (id/en)
- [x] 3.3 View mode toggle (list/grid)
- [x] 3.4 Hide dotfiles toggle
- [x] 3.5 Single click toggle
- [x] 3.6 Save button with toast feedback

---

## 4. Security Settings Tab

- [x] 4.1 Create `SecuritySettings.tsx` component
- [x] 4.2 Username change field
- [x] 4.3 Password change form
- [x] 4.4 Password strength indicator
- [x] 4.5 Submit with toast feedback
- [x] 4.6 Fix API interceptor to not redirect on error

---

## 5. Verification

- [x] 5.1 Go build passes
- [x] 5.2 Frontend build passes
- [x] 5.3 Settings page accessible via /settings
- [x] 5.4 API error handling fixed
