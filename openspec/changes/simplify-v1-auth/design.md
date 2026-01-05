# Design Document: Simplify v1.0 Auth & Add Share Management & i18n

## Overview

This document outlines the architectural design decisions for simplifying SatuFile v1.0 to a single-user deployment model, adding comprehensive share management UI, and implementing internationalization (i18n) support.

## 1. Authentication Simplification

### Current State
SatuFile currently supports multi-user authentication with:
- User registration/signup flow
- Multiple user accounts with separate scopes
- JWT-based authentication
- Role-based permissions (admin/user)

### Proposed Changes

#### 1.1 Remove Multi-User Architecture
**Decision:** Eliminate signup and multi-user support for v1.0

**Rationale:**
- Target deployment model: personal server where one person owns and manages the server
- Reduces code complexity and attack surface
- Simplifies user management to single admin account
- Removes need for user administration UI
- Reduces database schema complexity

**Implementation:**
```go
// Auto-create admin on startup if not exists
func EnsureAdminExists(repo *users.Repository) error {
    count, _ := repo.Count()
    if count == 0 {
        return repo.CreateAdmin("admin", "Admin123!")
    }
    return nil
}
```

**Trade-offs:**
| Pros | Cons |
|-------|-------|
| Simpler codebase | Cannot support multiple users |
| Less database overhead | Single point of credential compromise |
| Easier to maintain | Scaling limited to single admin |
| Faster development cycle | Not suitable for team deployments |

**Migration Path:**
- v1.0: Single admin only
- Future: Multi-tenant mode as optional feature flag
- Future: User provisioning for controlled environments

### 1.2 Authentication Flow Simplification

**Before (Multi-User):**
```
Signup → Create User → Assign Permissions → Issue Token → Login
  ↓           ↓              ↓              ↓           ↓
Database    Role Table   JWT Claims   Protected Routes
```

**After (Single Admin):**
```
Admin Already Created → Validate Credentials → Issue Token → Access
         ↓                      ↓               ↓            ↓
Database               Password Hash      JWT Claims   All Routes
```

**Security Considerations:**
- Admin credentials still hashed with bcrypt
- JWT tokens still expire (2 hours default)
- Rate limiting on login endpoint remains critical
- Setup wizard for first-run credential change (future enhancement)

---

## 2. Share Management System

### 2.1 Architecture

**Three-Layer Architecture:**

```
┌─────────────────────────────────────────┐
│         Frontend Layer             │
│  ┌───────────────────────────────┐  │
│  │  Shares Management Page     │  │
│  │  (MUI DataGrid)           │  │
│  └───────────────────────────────┘  │
└────────────┬──────────────────────────┘
             │ REST API
┌────────────▼──────────────────────────┐
│         Backend Layer              │
│  ┌───────────────────────────────┐  │
│  │  Shares API Handlers       │  │
│  │  - GET /api/shares        │  │
│  │  - DELETE /api/share/:id   │  │
│  └───────────────────────────────┘  │
└────────────┬──────────────────────────┘
             │ GORM ORM
┌────────────▼──────────────────────────┐
│         Database Layer            │
│  ┌───────────────────────────────┐  │
│  │  Links Table              │  │
│  │  (id, token, path, ...)   │  │
│  └───────────────────────────────┘  │
└───────────────────────────────────┘
```

### 2.2 Data Model

**Share Link Table (SQLite):**
```sql
CREATE TABLE links (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    path TEXT NOT NULL,
    type TEXT NOT NULL,  -- 'file' or 'folder'
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE INDEX idx_links_token ON links(token);
CREATE INDEX idx_links_expires ON links(expires_at);
CREATE INDEX idx_links_path ON links(path);
```

**GORM Model:**
```go
type Link struct {
    ID        string    `json:"id" gorm:"primaryKey"`
    Token     string    `json:"token" gorm:"uniqueIndex;not null"`
    Path      string    `json:"path" gorm:"index;not null"`
    Type      string    `json:"type" gorm:"not null"`
    ExpiresAt time.Time `json:"expires_at" gorm:"index"`
    CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}
```

### 2.3 UI Component Structure

```
frontend/src/features/settings/
├── SettingsPage.tsx          # Main settings with tabs
├── components/
│   ├── ProfileSettings.tsx    # Admin profile & password
│   ├── SharesPage.tsx         # Share management table
│   └── SecuritySettings.tsx   # (Future: security config)
└── tabs.ts                   # Settings tab navigation

frontend/src/features/shares/
├── PublicSharePage.tsx        # Public landing for shared files
└── index.ts                  # Exports

frontend/src/components/common/
├── ShareActionMenu.tsx        # Dropdown actions for share row
└── ShareStatusBadge.tsx       # Visual indicator (active/expiring/expired)
```

### 2.4 MUI DataGrid Configuration

**Why MUI DataGrid?**
- Built-in sorting, filtering, pagination
- Responsive design out of the box
- Consistent with existing MUI design system
- Good TypeScript support
- Active maintenance and community support

**Column Configuration:**
```typescript
const columns: GridColDef[] = [
  { 
    field: 'name', 
    headerName: 'File Name', 
    flex: 1,
    renderCell: (params) => (
      <Box display="flex" alignItems="center" gap={1}>
        <FileIcon type={params.row.type} />
        <Typography variant="body2">{params.row.name}</Typography>
      </Box>
    )
  },
  { 
    field: 'type', 
    headerName: 'Type', 
    width: 100,
    renderCell: (params) => <TypeChip type={params.row.type} />
  },
  { 
    field: 'created_at', 
    headerName: 'Created', 
    width: 150,
    type: 'dateTime'
  },
  { 
    field: 'expires_at', 
    headerName: 'Expires', 
    width: 150,
    renderCell: (params) => <ExpirationBadge date={params.row.expires_at} />
  },
  { 
    field: 'actions', 
    headerName: '', 
    width: 120,
    renderCell: (params) => <ShareActions share={params.row} />
  },
];
```

### 2.5 Public Share Page Design

**Access Flow:**
```
1. User opens: https://domain.com/share/{token}
2. Frontend router matches /share/:token
3. Component PublicSharePage mounts
4. API call: GET /api/share/public?token={token}
5. Backend validates token & expiration
6. If valid:
   - Render preview (if image/video/pdf)
   - Show download button
   - Display metadata
7. If invalid/expired:
   - Show error page
   - No authentication required
```

**Component Hierarchy:**
```
<PublicSharePage>
  <ErrorBoundary>
    {isLoading && <LoadingSpinner />}
    {error && <ErrorState message={error} />}
    {share && !error && (
      <ShareCard>
        <FilePreview file={share.file} />
        <ShareMetadata created={share.created_at} expires={share.expires_at} />
        <DownloadButton onClick={handleDownload} />
      </ShareCard>
    )}
  </ErrorBoundary>
</PublicSharePage>
```

---

## 3. Internationalization (i18n)

### 3.1 i18n Architecture

**Technology Choice: react-i18next**

**Rationale:**
- Industry standard for React i18n
- Excellent TypeScript support
- Namespace support for organized translations
- Lazy loading capability
- Active community and documentation
- Works well with Material UI

**Core Concepts:**
```
i18n System
├── Translation Files (JSON)
│   ├── en/common.json       # English translations
│   ├── en/files.json
│   ├── en/settings.json
│   ├── id/common.json       # Indonesian translations
│   ├── id/files.json
│   └── id/settings.json
├── Namespaces
│   ├── common    # Reusable strings (buttons, labels)
│   ├── files     # File management UI
│   ├── settings  # Settings and preferences
│   └── auth      # Login/authentication
└── Pluralization
    └── Language-specific plural rules (if needed later)
```

### 3.2 Configuration

**i18n Setup (main.tsx):**
```typescript
import i18n from './i18n/config';
import { I18nextProvider } from 'react-i18next';

ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

**Configuration (i18n/config.ts):**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enFiles from './locales/en/files.json';
import idCommon from './locales/id/common.json';
import idFiles from './locales/id/files.json';

const resources = {
  en: {
    common: enCommon,
    files: enFiles,
  },
  id: {
    common: idCommon,
    files: idFiles,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // Default language
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false, // Allow React components in translations
  },
  react: {
    useSuspense: false,
  },
});
```

### 3.3 Translation Key Convention

**Namespace Convention:**
```
{namespace}:{description}

Examples:
- common:saveButton
- common:deleteConfirmation
- files:uploadButton
- files:contextMenuDownload
- settings:languageSelector
- settings:sharesTable
```

**With Parameters:**
```json
{
  "deleteConfirmation": "Are you sure you want to delete {{fileName}}?",
  "filesCount": "{{count}} file(s)"
}
```

**Usage:**
```typescript
const { t } = useTranslation('files');
t('deleteConfirmation', { fileName: 'document.pdf' });
t('filesCount', { count: 5 });
```

### 3.4 Language Persistence

**Storage Strategy:**
```typescript
// 1. Load saved preference
const savedLang = localStorage.getItem('satufile-language') || 'en';

// 2. Apply to i18next
await i18n.changeLanguage(savedLang);

// 3. Watch for changes
const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  localStorage.setItem('satufile-language', lang);
  // No page reload needed - react-i18next handles re-render
};
```

### 3.5 Translation File Structure

**Example: locales/en/common.json**
```json
{
  "save": "Save",
  "cancel": "Cancel",
  "delete": "Delete",
  "rename": "Rename",
  "download": "Download",
  "share": "Share",
  "upload": "Upload",
  "preview": "Preview",
  "copy": "Copy",
  "close": "Close",
  "confirm": "Confirm",
  "back": "Back",
  "next": "Next",
  "previous": "Previous",
  "search": "Search",
  "filter": "Filter",
  "refresh": "Refresh",
  "loading": "Loading...",
  "error": "Error",
  "success": "Success"
}
```

**Example: locales/id/common.json**
```json
{
  "save": "Simpan",
  "cancel": "Batal",
  "delete": "Hapus",
  "rename": "Ubah Nama",
  "download": "Unduh",
  "share": "Bagikan",
  "upload": "Unggah",
  "preview": "Pratinjau",
  "copy": "Salin",
  "close": "Tutup",
  "confirm": "Konfirmasi",
  "back": "Kembali",
  "next": "Berikutnya",
  "previous": "Sebelumnya",
  "search": "Cari",
  "filter": "Filter",
  "refresh": "Muat Ulang",
  "loading": "Memuat...",
  "error": "Error",
  "success": "Berhasil"
}
```

### 3.6 Component Integration

**Using useTranslation Hook:**
```typescript
import { useTranslation } from 'react-i18next';

export const UploadButton: React.FC = () => {
  const { t } = useTranslation('files');
  
  return (
    <Button variant="contained">
      {t('uploadButton')}
    </Button>
  );
};
```

**With Namespaces:**
```typescript
const { t: tCommon } = useTranslation('common');
const { t: tFiles } = useTranslation('files');

// Usage
tCommon('save')
tFiles('uploadButton')
```

---

## 4. Integration Strategy

### 4.1 Phase Sequence

```
Phase 1: Auth Simplification (Day 1)
  ├─ Remove signup API
  ├─ Remove signup UI
  ├─ Update routes
  └─ Clean up codebase

Phase 2: Share Management (Days 2-4)
  ├─ Backend: Add share list API
  ├─ Backend: Enhance public share endpoint
  ├─ Frontend: Build shares page
  ├─ Frontend: Create public share landing
  └─ Integration: Wire everything together

Phase 3: i18n Infrastructure (Days 5-6)
  ├─ Setup react-i18next
  ├─ Create translation files
  ├─ Add language selector
  └─ Persist language preference

Phase 4: Translation & Polish (Day 7)
  ├─ Translate all UI components
  ├─ Test language switching
  ├─ Cross-browser testing
  └─ Documentation updates
```

### 4.2 Risk Mitigation

**Risk: Breaking change for existing deployments**
- **Mitigation:** Document v1.0 single-user nature clearly
- **Mitigation:** Preserve admin account creation logic
- **Mitigation:** Keep default credentials for first-time users

**Risk: i18n adds development overhead**
- **Mitigation:** Start with only EN/ID (minimal scope)
- **Mitigation:** Use tooling to find missing translation keys
- **Mitigation:** Establish clear naming conventions early

**Risk: Share management UI complexity**
- **Mitigation:** Use proven MUI DataGrid component
- **Mitigation:** Start with basic CRUD, add filters later
- **Mitigation:** Reuse existing components (dialogs, toasts)

---

## 5. Technical Decisions Summary

| Decision | Option Chosen | Rationale |
|-----------|----------------|------------|
| Auth Model | Single admin only | Fits target use case, reduces complexity |
| Table Library | MUI DataGrid | Consistent with MUI, feature-rich |
| i18n Library | react-i18next | Industry standard, good TS support |
| Language Storage | localStorage | Simple, no backend changes needed |
| Default Language | English | Wider audience, Indonesian as first addition |
| Share Page Routing | Public route (no auth) | Simplest for shared file access |
| Translation Format | JSON files | Easy to edit, i18next native |

---

## 6. Future Extensibility

### 6.1 Multi-User Support
**Design for Future Enhancement:**
```typescript
// Current: Hardcoded single admin
const IS_SINGLE_USER = true;

// Future: Config-driven
const isMultiTenant = config.features.multiUser;

// Can add:
// - User management UI
// - Role assignment
// - Per-user quotas
// - User scopes/roots
```

### 6.2 Additional Languages
**Adding New Language:**
1. Create `locales/fr/common.json` (French example)
2. Add to i18n resources configuration
3. Add language option to selector
4. Translate all UI keys
5. Test language switching

### 6.3 Advanced Sharing
**Future Features (Out of Scope):**
- Share password protection
- Share download limits (max downloads, IP restrictions)
- Share usage analytics (view count, download count)
- Share QR code generation
- Email notifications for shares
- Temporary share links with auto-revocation

### 6.4 Enhanced i18n
**Future Enhancements:**
- RTL (Right-to-Left) language support
- Pluralization rules per language
- Date/number formatting per locale
- Translation contribution workflow
- In-app translation editor for admins

---

## 7. Performance Considerations

### 7.1 Share Management
- **Pagination:** Limit table to 50 items per page for large share lists
- **Debouncing:** Debounce search input (300ms) to reduce API calls
- **Caching:** Cache share list during session
- **Virtualization:** MUI DataGrid handles virtualization automatically

### 7.2 i18n Performance
- **Lazy Loading:** Load only active language translations
- **Tree Shaking:** i18next builds eliminate unused translations
- **LocalStorage:** Avoid API calls for language persistence

### 7.3 Public Share Access
- **CDN Support:** Design for future CDN file serving
- **Caching:** Set cache headers for shared static assets
- **Rate Limiting:** Protect against abuse of public links

---

## 8. Security Considerations

### 8.1 Auth Simplification
- Admin credentials still must be strong
- Change password immediately after first login (add warning)
- Document credential management best practices

### 8.2 Share Management
- Share tokens must be cryptographically secure (already implemented)
- Share links must validate expiration before access (already implemented)
- Revocation must be immediate (DELETE API)
- Rate limit public share endpoints

### 8.3 i18n
- Translation files must not contain executable code
- Validate language selection (whitelist supported codes)
- Never trust client-side language preference for auth decisions

---

## 9. Testing Strategy

### 9.1 Unit Tests
```go
// Backend
func TestEnsureAdminExists(t *testing.T)
func TestGetShares(t *testing.T)
func TestRevokeShare(t *testing.T)
```

```typescript
// Frontend
describe('SharesPage', () => {
  it('displays share list', () => {});
  it('copies share link', () => {});
  it('revokes share with confirmation', () => {});
});

describe('i18n', () => {
  it('switches language', () => {});
  it('persists language preference', () => {});
});
```

### 9.2 Integration Tests
- Test full share creation → management → revocation flow
- Test language switching across all pages
- Test public share access without authentication
- Test expired/invalid share link behavior

### 9.3 E2E Tests (Optional)
- Playwright tests for:
  - Admin login with single user
  - Navigate to shares management
  - Create, view, revoke share
  - Switch languages
  - Access public share link

---

## 10. Monitoring & Observability

### 10.1 Metrics to Track
- Share creation rate
- Share revocation rate
- Public share access rate
- Failed share access attempts (invalid tokens)
- Language usage distribution

### 10.2 Logging
- Log share creation with file metadata
- Log share revocation with reason (admin action)
- Log public share access with IP/user-agent
- Log language changes

---

## Conclusion

This design simplifies SatuFile v1.0 for single-user deployments while adding essential management capabilities for file sharing and internationalization. The architecture prioritizes:

1. **Simplicity** - Remove unnecessary multi-user complexity
2. **Usability** - Intuitive share management UI
3. **Extensibility** - Design allows future enhancements
4. **Security** - Maintain secure token generation and validation
5. **Performance** - Efficient data loading and language switching

The chosen technologies (MUI DataGrid, react-i18next, SQLite with GORM) align with existing stack and provide solid foundations for the required features.