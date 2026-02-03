## Why

Standardizing frontend imports using the `@` alias improves code readability and maintainability by providing a consistent way to reference project directories regardless of file depth. Removing unused module declarations reduces technical debt, keeps the codebase clean, and avoids confusion for developers.

## What Changes

- **Import Standardization**: All relative imports in `frontend/src` that point to internal project directories will be converted to use the `@` alias (e.g., `import { X } from '@/components/...'` instead of `import { X } from '../../components/...'`).
- **Unused Module Cleanup**: Identified unused imports and variable declarations in frontend files will be removed.

## Capabilities

### New Capabilities
- None

### Modified Capabilities

- `project-setup`: Refine frontend structure requirements to include standardized import aliases and clean code practices.

## Impact

- All files within `frontend/src/`.
- Developer experience in the frontend codebase.
