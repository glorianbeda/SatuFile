# Change: First Login Setup

## Why
Meningkatkan keamanan dengan memaksa user mengganti password default saat login pertama kali (terutama admin yang dibuat otomatis).

## What Changes

### Backend
- Tambah field `must_change_password` di User model
- Buat endpoint `POST /api/change-password` 
- Validasi password: min 8 karakter, huruf besar, angka, simbol
- Update login response untuk include `mustChangePassword` flag

### Frontend
- Buat modal/page ChangePasswordModal
- Deteksi `mustChangePassword` dari login response
- Force user ke modal sebelum bisa akses app
- Form: username (opsional), password baru, konfirmasi password
- Validasi strength password secara real-time

## Impact
- Affected specs: `authentication`
- Affected code: 
  - Backend: `users/model.go`, `routes/api/login.post.go`, new `routes/api/change-password.post.go`
  - Frontend: new `ChangePasswordModal.tsx`, update `AuthContext.tsx`

## Technical Notes

> [!IMPORTANT]
> Password requirements:
> - Minimal 8 karakter
> - Minimal 1 huruf besar (A-Z)
> - Minimal 1 angka (0-9)
> - Minimal 1 simbol (!@#$%^&*...)

### Flow
```
Login → mustChangePassword: true → Show ChangePasswordModal → Submit → Update user → Continue to app
```
