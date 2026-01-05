# Change: Add Profile Settings Menu

## Why

User butuh halaman pengaturan profil untuk mengelola preferensi dan keamanan akun.

## What Changes

Berdasarkan filebrowser-master, berikut fitur settings yang akan diimplementasikan:

### Profile Settings (Preferensi)

| Setting | Deskripsi |
|---------|-----------|
| **Language** | Pilihan bahasa (id/en) |
| **View Mode** | Tampilan file: list/grid |
| **Hide Dotfiles** | Sembunyikan file dengan prefix "." |
| **Single Click** | Buka file dengan single click (bukan double) |
| **Dark Mode** | Toggle tema gelap/terang |

### Security Settings

| Setting | Deskripsi |
|---------|-----------|
| **Change Password** | Ubah password dengan konfirmasi |
| **Username** | Ubah username (opsional) |

### Account Info (Read-only)

| Info | Deskripsi |
|------|-----------|
| **Created At** | Tanggal akun dibuat |
| **Storage Used** | Penggunaan storage |
| **Permissions** | Daftar izin (create, delete, dll) |

## UI Design

```
┌─────────────────────────────────────┐
│ Pengaturan                          │
├─────────────────────────────────────┤
│ [Tab: Profil] [Tab: Keamanan]       │
├─────────────────────────────────────┤
│ Profil:                             │
│ ○ Bahasa: [Dropdown]                │
│ ○ View Mode: [List/Grid]            │
│ ○ Sembunyikan Dotfiles: [Toggle]    │
│ ○ Single Click: [Toggle]            │
│                                     │
│ [Simpan Perubahan]                  │
├─────────────────────────────────────┤
│ Keamanan:                           │
│ ○ Username Baru: [Input]            │
│ ○ Password Baru: [Input]            │
│ ○ Konfirmasi: [Input]               │
│                                     │
│ [Ubah Password]                     │
└─────────────────────────────────────┘
```

## Impact

- New: `features/settings/pages/SettingsPage.tsx`
- New: `features/settings/components/ProfileSettings.tsx`
- New: `features/settings/components/SecuritySettings.tsx`
- Modified: `routes.tsx` - Add /settings route
- Backend: Update user API untuk save preferences
