## Why

Files starting with a dot (e.g., `.env`, `.config`) are conventionally treated as hidden files in unix-like systems. Currently, the file browser displays them alongside regular files, cluttering the view. Users expect these files to be hidden by default but retrievable when needed.

## What Changes

- Filter out files starting with `.` from the file list by default.
- Add a mechanism to toggle the visibility of these hidden files (e.g., via a setting or view option).
- Persist the visibility preference so it remains consistent across sessions.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `files`: Update filtering logic to support hidden files concept.

## Impact

- **Frontend**: `frontend/src/features/files/HomePage.tsx` (filtering logic).
