# Design: Enhance UI Design

## Context
Transform the basic scaffold UI into a modern, polished file manager interface following the user's reference image. Primary color changes from default MUI blue to Twitter Blue.

## Goals / Non-Goals

### Goals
- Modern, clean aesthetic matching reference
- Twitter Blue (#1DA1F2) as primary color
- Responsive layout with sidebar
- Professional file list with proper iconography
- Storage usage visualization

### Non-Goals
- Actual file operations (separate feature)
- Backend API changes
- Authentication UI

## Design Decisions

### 1. Color Palette
```
Primary: #1DA1F2 (Twitter Blue)
Primary Light: #71C9F8
Primary Dark: #0C7ABF
Background: #F8FAFC (light gray)
Surface: #FFFFFF
Text Primary: #1C2B33
Text Secondary: #657786
Success: #17BF63
Error: #E0245E
```

### 2. Component Architecture
```
components/
├── common/
│   ├── Button.tsx       (existing, update style)
│   ├── Card.tsx         (existing, update style)
│   ├── SearchBar.tsx    (new)
│   ├── CircularProgress.tsx (new - storage chart)
│   └── FileIcon.tsx     (new)
├── layout/
│   ├── Layout.tsx       (update)
│   ├── Header.tsx       (new - extracted)
│   ├── Sidebar.tsx      (new - extracted)
│   └── StoragePanel.tsx (new)
└── files/
    ├── FileList.tsx     (new)
    ├── FileRow.tsx      (new)
    ├── RecentFiles.tsx  (new)
    ├── CategoryFilter.tsx (new)
    └── UploadModal.tsx  (new)
```

### 3. Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: Search | Actions | Profile                      │
├──────────────────────────────────────────┬──────────────┤
│                                          │ Storage      │
│ Recently Modified (cards)                │ Usage        │
│                                          │ (circle)     │
│ Category Filters                         │              │
│                                          │ File Types   │
│ File List (table)                        │ Breakdown    │
│                                          │              │
└──────────────────────────────────────────┴──────────────┘
```

### 4. Key Styling Patterns
- Border radius: 12px for cards, 24px for buttons
- Shadow: `0 2px 8px rgba(0,0,0,0.08)`
- Hover: Subtle background change + slight scale
- Transitions: 200ms ease-out

## Risks / Trade-offs
| Risk | Mitigation |
|------|------------|
| Increased bundle size | Use tree-shaking, lazy load icons |
| Complex responsive | Mobile-first approach |
| Theme consistency | Centralize in ThemeProvider |
