# Design: Setup Project Scaffold

## Context
SatuFile is a new cloud drive web application following filebrowser-master as reference. Unlike filebrowser (Vue frontend), SatuFile uses React + Material UI for the frontend while keeping Go for the backend.

**Stakeholders:** Developer(s) building SatuFile
**Reference:** `/home/glo/DokumenAne/filebrowser-master`

## Goals / Non-Goals

### Goals
- Establish maintainable Go backend structure
- Create React frontend with reusable MUI components
- Enable single-binary deployment (Go serves React)
- Follow filebrowser patterns where applicable

### Non-Goals
- Implement actual features (auth, files, etc.)
- Add database schema
- Production-ready security hardening

## Decisions

### 1. Backend Framework
**Decision:** Use Gorilla Mux (following filebrowser)
**Alternatives:**
- Chi router - Slightly more modern, but filebrowser uses Mux
- Gin - More features, but heavier
- Standard library - Too minimal

**Rationale:** Consistency with reference codebase aids learning and porting.

### 2. Frontend State Management
**Decision:** React Context + custom hooks (start simple)
**Alternatives:**
- Zustand - Minimal, but adds dependency
- Redux Toolkit - Overkill for initial scaffold
- Jotai/Recoil - Atomic state, more complex

**Rationale:** Start minimal, add Zustand when state complexity grows.

### 3. Component Library
**Decision:** Material UI v5+
**Why:** User requested MUI for reusable components.

### 4. Package Manager
**Decision:** pnpm (following filebrowser-master)
**Rationale:** Faster, disk-efficient, works well with monorepo patterns.

## Directory Mapping (filebrowser → SatuFile)

| filebrowser (Vue) | SatuFile (React) |
|-------------------|------------------|
| `frontend/src/components/` | `frontend/src/components/common/` |
| `frontend/src/views/` | `frontend/src/features/*/` |
| `frontend/src/stores/` | `frontend/src/contexts/` |
| `frontend/src/api/` | `frontend/src/api/` |
| Backend unchanged | Same structure |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| MUI adds bundle size | Tree-shaking, lazy loading |
| Diverging from filebrowser patterns | Document differences in project.md |
| Over-engineering initial scaffold | Keep minimal, add complexity per feature |

## Open Questions
- None currently - minimal scaffold doesn't require complex decisions
