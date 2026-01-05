# Change: Responsive Header & Toast Notifications

## Why

1. **Toast System** - Perlu feedback visual untuk success/error di seluruh app
2. **Responsive Header** - Top navigation kepotong/berantakan di mobile/tablet

## What Changes

### 1. Toast/Snackbar System

- Buat `ToastProvider` context dengan MUI Snackbar
- Hook `useToast()` untuk trigger toast dari mana saja
- Support: success, error, warning, info

### 2. Responsive Header

- Collapse search bar di mobile → icon only
- Hide "Upload file" text → icon only di mobile
- Hide "Create" button di mobile
- Gunakan IconButton untuk semua actions di mobile

## Impact

- New: `contexts/ToastProvider.tsx`
- Modified: `components/layout/Header.tsx`
- Modified: `App.tsx` (wrap with ToastProvider)
