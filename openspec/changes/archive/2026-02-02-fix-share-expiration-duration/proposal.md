## Why

Users are creating share links with expiration (e.g., 1 hour), but the UI is not reflecting this expiration properly, or the link created doesn't have the expected expiration. This leads to confusion about whether the link is actually temporary. We need to ensure that when a user selects an expiration, the backend respects it and the UI confirms it.

## What Changes

- Verify that the expiration unit/value sent from the frontend matches what the backend expects.
- Ensure the backend correctly calculates the expiration time based on the unit and value.
- Update the UI to display the expiration status of created links if missing.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `shares`: Fix expiration calculation logic.

## Impact

- **Frontend**: `frontend/src/api/files.ts` (createShare), `frontend/src/components/files/ShareDialog.tsx`.
- **Backend**: `routes/api/share.post.go`, `share/share.go`.
