## Context

Currently, the user can manually hide a file by renaming it with a dot prefix. However, these files still appear in the file list unless they are explicitly filtered out. We need to implement a mechanism to filter out these "hidden" files from the view by default, and provide a user setting to toggle their visibility.

## Goals / Non-Goals

**Goals:**
- Filter out files/folders starting with `.` from the main file list by default.
- Provide a toggle (e.g., in user settings or a view option) to "Show Hidden Files".
- Ensure that when "Show Hidden Files" is enabled, these files appear.
- Persist this preference.

**Non-Goals:**
- Implementing system-level file attributes (like Windows "Hidden" attribute). We rely on the unix-style dot convention.
- Server-side filtering (filtering will happen on the frontend for simplicity and responsiveness).

## Decisions

### 1. Client-Side Filtering
We will filter the file list in `HomePage.tsx` before passing it to `FileList` or `FileGrid`.
- **Rationale**: The API returns all files. Client-side filtering is fast and allows instant toggling without re-fetching.

### 2. Visibility State
We will use a state variable `showHiddenFiles` in `HomePage.tsx`.
- **Persistence**: We can store this in `localStorage` so it persists across sessions.
- **Toggle**: We will add a menu item in the `FolderToolbar` (e.g., inside a "View Options" menu or a dedicated button). Or simply a toggle in the settings page?
- **Decision**: Since the user mentioned "pergi ke pengaturan > tampilkan file tersembunyi", we should probably add it to the `SettingsPage`. However, for immediate usability, a toggle in the `FolderToolbar` or `Header` might be better. The prompt says "go to Settings > Show Hidden Files". We should respect that if possible, but `SettingsPage` is a separate route. If we put the toggle there, we need a global context (e.g., `SettingsContext` or `AppContext`) to share the state.
- **Simplification**: For now, we'll keep it local to `HomePage` or use `localStorage` which `HomePage` reads on mount. If we really want it in "Settings", we'd need a context. Let's assume `localStorage` is the source of truth.

## Risks / Trade-offs

- **Risk**: User might forget they hid files.
    - **Mitigation**: The toggle should be discoverable.

## Migration Plan
N/A
