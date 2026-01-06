## 1. Backend Implementation
- [x] 1.1 Create language validation constants (`users/locales.go`)
  - Define `SupportedLocales = []string{"en", "id"}`
  - Add `IsValidLocale(locale string) bool` function
  - Add `DefaultLocale = "id"` constant (matches current default)
- [x] 1.2 Update `routes/api/info.get.go`
  - Add `supportedLanguages` field to info response
  - Return list of supported language codes and names
- [x] 1.3 Enhance `routes/api/me.put.go`
  - Add locale validation using `IsValidLocale()`
  - Return 400 Bad Request for invalid locale codes
  - Ensure locale is properly saved to database
- [x] 1.4 Verify `users/repository.go`
  - Ensure `Update()` properly persists Locale field
  - Add default locale to CreateAdmin function

## 2. Frontend i18n Configuration
- [x] 2.1 Refactor `frontend/src/i18n/config.ts`
  - Change initialization to accept language parameter
  - Remove hardcoded localStorage check during init
  - Export function `initI18n(locale: string)` for dynamic language change
  - Keep fallback to 'en' if locale is invalid
- [x] 2.2 Create `frontend/src/i18n/utils.ts`
  - Add `getDefaultLanguage()` function
  - Check for stored preference first (localStorage)
  - Fallback to browser language detection
  - Final fallback to 'id'
- [x] 2.3 Update `frontend/src/main.tsx`
  - NOTE: Already correctly configured - imports i18n/config which initializes with default
  - Language sync handled by AuthContext on login
  - Re-initialization not needed as AuthContext calls i18n.changeLanguage()

## 3. AuthContext Integration
- [x] 3.1 Update `frontend/src/contexts/AuthContext.tsx`
  - After successful login, call `i18n.changeLanguage(user.locale)`
  - Store user's locale in localStorage for persistence
  - Update user state to reflect locale change
  - Also sync language on token refresh/initial load
- [x] 3.2 Handle logout
  - Keep last selected language in localStorage for next session
  - Language preference preserved across sessions

## 4. Settings Page Updates
- [x] 4.1 Update `frontend/src/features/settings/components/ProfileSettings.tsx`
  - Updated LanguageSelector with syncToBackend prop
  - LanguageSelector handles API sync, localStorage update, and i18n change
  - No need to handle language in Save button as it syncs immediately
  - ProfileSettings still handles other preferences (viewMode, hideDotfiles, singleClick)

## 5. Language Sync Helper
- [x] 5.1 Create `frontend/src/hooks/useLanguage.ts`
  - DECISION: Instead of separate hook, integrated language sync into LanguageSelector component
  - LanguageSelector now accepts `syncToBackend` prop for authenticated users
  - Simplifies usage and reduces boilerplate
- [x] 5.2 Integrate language sync
  - LanguageSelector handles all sync logic internally
  - Used in ProfileSettings with syncToBackend=true
  - AuthContext handles initial sync on login

## 6. Translation Completeness Check
- [x] 6.1 Audit all translation files
  - Verified all translation files exist for en/ and id/
  - Files: auth, common, files, settings, shares (5 per language = 10 total)
- [ ] 6.2 Add translation for new error messages
  - Need to add error message for "Failed to save language preference"
  - Currently using hardcoded English in toast.error()

## 7. Testing & Validation
- [ ] 7.1 Manual testing - Language persistence
  - Test language change while logged in
  - Log out and log back in - verify language persists
  - Clear browser cache - verify language still persists from database
- [ ] 7.2 Manual testing - Language sync
  - Change language in settings - verify immediate UI update
  - Check localStorage is updated
  - Verify database is updated (via API response)
- [ ] 7.3 Manual testing - Fallback behavior
  - Test with invalid locale in database (should use default)
  - Test with corrupted localStorage (should use database)
  - Test new user (should use default 'id')
- [ ] 7.4 Cross-browser testing
  - Test language persistence in Chrome, Firefox, Safari
  - Verify localStorage behavior is consistent

## 8. Documentation
- [ ] 8.1 Update `openspec/project.md` (if needed)
  - Document language persistence strategy
  - Add supported languages section
- [ ] 8.2 Update README.md (if needed)
  - Document how language preferences are stored
  - Explain that language persists across devices for logged-in users

## 9. Code Cleanup
- [x] 9.1 Remove unused localStorage-first initialization from i18n config
  - Removed from config.ts, moved to utils.ts
  - AuthContext now controls initialization flow
- [ ] 9.2 Add comments explaining language initialization flow
  - Need to add inline comments in AuthContext
  - Document the priority: backend (user.locale) > localStorage > browser > default
- [ ] 9.3 Ensure no duplicate language initialization code
  - Clean up ProfileSettings - remove locale from handleSave as it's now handled by LanguageSelector

## Implementation Notes
- Language change is now immediate (syncs to backend on selection)
- AuthContext handles language sync on login and token refresh
- LanguageSelector is the single source of truth for language changes in UI
- Backend validates locale codes to ensure only supported languages are saved
- New users default to 'id' (Indonesian) as specified in locales.go
- Logout preserves language preference for next session
