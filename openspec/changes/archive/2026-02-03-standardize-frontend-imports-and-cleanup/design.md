## Context

The frontend project (React + TypeScript + Vite) already has a `@` alias configured in both `vite.config.ts` and `tsconfig.app.json` that points to the `src/` directory. However, a significant number of files still use relative paths (e.g., `../../components/...`) for internal imports. Additionally, while TypeScript is configured to catch unused locals and parameters, some files may still contain unused imports or declarations that need cleanup.

## Goals / Non-Goals

**Goals:**
- Convert all internal relative imports in `frontend/src` to use the `@` alias.
- Remove all unused imports and variable declarations across the frontend codebase.
- Ensure the project continues to build and run correctly after these changes.

**Non-Goals:**
- Changing any application logic or UI behavior.
- Modifying backend code.
- Adding new dependencies.

## Decisions

- **Systematic Update**: We will perform a directory-by-directory sweep of `frontend/src` to identify and update relative imports.
- **Manual Verification**: After automated or semi-automated replacement, each file will be checked for correct resolution.
- **Lint-Driven Cleanup**: Use the existing TypeScript compiler and ESLint (if configured) to identify unused code blocks for removal.

## Risks / Trade-offs

- **[Risk]**: Accidental breakage of imports if paths are incorrectly calculated.
  - **Mitigation**: Verify the build (`npm run build` or `tsc`) after major changes and use the IDE's path resolution to confirm correctness.
- **[Risk]**: Removing code that is actually used (e.g., side-effect imports).
  - **Mitigation**: Be cautious with side-effect imports (like CSS or polyfills) and only remove items explicitly flagged as unused by the compiler/linter.
