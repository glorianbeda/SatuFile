# Change: Fix i18n Language Persistence and Sync

## Why
The current multilanguage implementation has several issues:
1. Language preference is stored only in localStorage, not persisted in the database
2. Language changes are lost when users log out/in or clear browser data
3. No synchronization between frontend and backend language settings
4. Backend lacks validation for supported language codes
5. User.Locale field exists in database model but is not utilized properly

This creates a poor user experience where language preferences don't persist reliably across sessions and devices.

## What Changes

### Backend Changes
- Add language validation middleware/constants
- Enhance `PUT /api/me` to properly validate and store language preference
- Add default language setting in user creation
- Ensure User.Locale is properly saved and returned

### Frontend Changes
- Initialize i18n from user profile (from API) instead of localStorage first
- Sync language changes to backend via API when user is logged in
- Fall back to localStorage only for non-authenticated users
- Remove redundant localStorage-first initialization
- Update AuthContext to handle language initialization on login

**BREAKING:** Language initialization will now prioritize backend over localStorage for logged-in users

### API Changes
- Add supported languages list to `/api/info` endpoint
- Validate locale values in `PUT /api/me` (only allow 'en', 'id')

## Impact
- Affected specs: `settings` (Profile Preferences requirement)
- Affected code:
  - `frontend/src/i18n/config.ts` - initialization logic
  - `frontend/src/contexts/AuthContext.tsx` - language sync on login
  - `frontend/src/features/settings/components/ProfileSettings.tsx` - language change handler
  - `routes/api/me.put.go` - add validation
  - `routes/api/info.get.go` - add supported languages
  - `users/repository.go` - ensure locale is properly saved
