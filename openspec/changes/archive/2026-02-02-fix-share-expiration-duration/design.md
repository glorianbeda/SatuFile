## Context

The share functionality allows users to set an expiration time for shared links. However, there are reports that links created with a 1-hour expiration do not show an expiration date or behave as permanent links. This suggests a mismatch between the frontend's request format and the backend's expectation, or a calculation error in the backend.

## Goals / Non-Goals

**Goals:**
- Fix the expiration time calculation for share links.
- Ensure the backend correctly interprets units like "1 hour", "7 days", etc.
- Verify the frontend sends the correct parameters.

**Non-Goals:**
- changing the share link format/token generation.
- modifying the UI design beyond fixing the displayed status.

## Decisions

### 1. Backend Calculation Logic
We will inspect `routes/api/share.post.go` to ensure it parses the `expires` and `unit` fields correctly.
- If the unit is "hour" or "hours", it should add `value * time.Hour`.
- We must handle cases where `unit` might be missing or capitalized differently.

### 2. Frontend Request
We will verify `frontend/src/api/files.ts` `createShare` function to ensure it passes `expires` as a string/number and `unit` as expected by the Go backend (likely a struct).

## Risks / Trade-offs

- **Risk**: Existing shares might have incorrect expiration dates.
    - **Mitigation**: This fix applies to new shares. Existing shares are immutable in terms of creation time, but we can't easily "fix" their expiration if it was calculated wrong at creation, unless we run a migration (out of scope for this quick fix).

## Migration Plan
N/A
