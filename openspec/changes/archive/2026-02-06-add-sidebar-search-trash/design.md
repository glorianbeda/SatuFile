# Design: Sidebar, Search, and Trash Features

## Context

The current SatuFile application has no persistent navigation structure. The header contains a search bar placeholder and action buttons, but users must rely on breadcrumb navigation to understand their location. File deletion is permanent, and there is no way to search for files within the storage.

This design addresses three interconnected features:
1. **Sidebar Navigation** - Persistent left panel with quick access to sections and storage overview
2. **File Search** - Global search functionality for finding files by name
3. **Trash Bin** - Recovery mechanism for accidentally deleted files

## Goals / Non-Goals

**Goals:**
- Add persistent sidebar with navigation and storage quick view
- Implement storage analysis page showing disk usage breakdown
- Enable global search for files by filename
- Provide trash bin with restore and empty trash functionality
- Maintain single-user deployment model

**Non-Goals:**
- Full-text search (searching inside file contents)
- Multi-user support with shared storage quotas
- Search result pagination (return all results at once)
- Trash auto-cleanup based on age (manual empty only for now)
- Drag-and-drop file reordering in sidebar

## Decisions

### Decision: Sidebar Structure

```
┌─────────────────────────────────────┐
│  📁 Files                           │  ← Navigate to home
│     📄 Documents                   │
│     📄 Pictures                    │
│     📄 Videos                      │
│     📄 Audio                      │
│     📄 Downloads                   │
├─────────────────────────────────────┤
│  🔍 Search                         │  ← Expandable search bar
├─────────────────────────────────────┤
│  🗑️ Trash                          │  ← Navigate to trash page
├─────────────────────────────────────┤
│                                     │
│  💾 Storage                        │  ← Click to expand
│  ████████░░ 45.2 GB / 100 GB      │  ← Progress bar
│                                     │
│  [Storage Analysis >]              │  ← Link to storage page
└─────────────────────────────────────┘
```

**Rationale:** Standard left-sidebar pattern familiar to users (like Google Drive, Dropbox). Storage indicator at bottom provides constant visibility of disk usage.

### Decision: Trash Implementation

**Choice:** Use SQLite table for trash tracking with original path preservation

```sql
CREATE TABLE trash (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_path TEXT NOT NULL,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_size INTEGER,
    is_directory INTEGER
);
```

**Rationale:**
- Simple tracking without moving actual files
- Original path allows accurate restore
- Timestamps enable future auto-cleanup features
- File size tracking supports storage calculations

**Alternative Considered:** Move files to .trash directory
- Pros: File system level, no database needed
- Cons: Path changes, harder to restore with original structure

### Decision: Search Implementation

**Choice:** Simple LIKE-based search on filename column

```sql
SELECT path, name, size, modified 
FROM resources 
WHERE name LIKE '%query%'
ORDER BY modified DESC
LIMIT 50;
```

**Rationale:**
- Single-user deployment with limited files
- SQLite handles 10,000+ file queries efficiently
- No external search engine dependency
- Case-insensitive by default in SQLite

**Alternative Considered:** Full-text search with SQLite FTS5
- Pros: Faster, supports more complex queries
- Cons: Added complexity, larger database size
- Deferred to future if needed

### Decision: Storage Calculation

**Choice:** Calculate on-demand with caching

- Compute total size by walking filesystem
- Cache result for 5 minutes
- Invalidate cache on file operations

**Rationale:**
- Single-user deployment, files change infrequently
- No background worker needed
- Simple implementation

## UI Mockups

### Sidebar Component Structure

```
Sidebar/
├── NavSection/
│   ├── NavItem (Files - Home)
│   ├── NavItem (Documents)
│   ├── NavItem (Pictures)
│   ├── NavItem (Videos)
│   ├── NavItem (Audio)
│   └── NavItem (Downloads)
├── SearchSection/
│   └── SearchInput (expandable)
├── TrashNavItem/
└── StorageSection/
    ├── StorageIndicator (progress bar)
    └── StorageLink (to Storage page)
```

### Storage Analysis Page

```
┌────────────────────────────────────────────────────────────┐
│ Storage Analysis                                [ < Back ] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Total Used: 45.2 GB / 100 GB                              │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📁 Documents    ████████████████████░░░░   25.3 GB  │  │
│  │ 📁 Pictures     ████████████░░░░░░░░░░░░   12.1 GB  │  │
│  │ 📁 Videos       ██████████░░░░░░░░░░░░░    5.8 GB   │  │
│  │ 📁 Audio        ████░░░░░░░░░░░░░░░░░░░    1.5 GB   │  │
│  │ 📁 Downloads    ██░░░░░░░░░░░░░░░░░░░░░    0.5 GB   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  [Clean Up Large Files...]                                 │
└────────────────────────────────────────────────────────────┘
```

### Trash Page

```
┌────────────────────────────────────────────────────────────┐
│ Trash                                              [ < Back │
├────────────────────────────────────────────────────────────┤
│  [ ✓ Select All ]  [ 🗑️ Empty Trash ]                      │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📄 old-report.docx    Deleted: 2 hours ago   [↩️]  │  │
│  │ 📄 temp-archive.zip    Deleted: Yesterday    [↩️]  │  │
│  │ 📁 old-project/        Deleted: 3 days ago   [↩️]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Items in trash are permanently deleted after 30 days.      │
└────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Search

```
GET /api/search?q={query}
Response: { results: [{ path, name, size, modified, isDirectory }] }
```

### Trash

```
GET /api/trash          - List trashed items
POST /api/trash/{path}/restore  - Restore item
DELETE /api/trash/{id}  - Permanently delete one item
DELETE /api/trash       - Empty all trash
```

### Storage

```
GET /api/storage/stats  - Get storage breakdown
GET /api/storage/usage  - Get total used/free space
```

## Routes

```
/                  - Home (Files)
/storage           - Storage Analysis page
/trash             - Trash page
```

## Risks / Trade-offs

[Risk] Large number of files slows down search
→ Mitigation: Add LIMIT 50 to results, add debounce to search input

[Risk] Storage calculation slow on large filesystems
→ Mitigation: Cache results for 5 minutes, show loading state

[Risk] Trash table grows indefinitely
→ Mitigation: Add 30-day auto-delete in future, add "Empty Trash" button

## Migration Plan

1. **Database Migration:**
   - Create trash table
   - Add deleted_at column to resources tracking (optional)

2. **Backend Changes:**
   - Modify DELETE /api/resources/{path} to move to trash instead of delete
   - Add trash API endpoints
   - Add search API endpoint
   - Add storage stats endpoint

3. **Frontend Changes:**
   - Add Sidebar component
   - Add Search component
   - Add Storage page
   - Add Trash page
   - Update routes

4. **Testing:**
   - Test search returns correct results
   - Test trash restore to original location
   - Test storage calculation accuracy

## Open Questions

1. Should search also match folder names, or just files?
2. Should trash show items sorted by deletion date (newest first)?
3. Should storage analysis be expandable inline in sidebar or separate page?
