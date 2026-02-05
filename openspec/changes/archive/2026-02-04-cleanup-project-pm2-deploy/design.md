# Design: Cleanup Project and PM2 Native Deployment

## Context

The project currently has unused deployment-related files from previous deployment strategies (deploy.sh script, Docker configuration) that are no longer needed. We are transitioning to native PM2 deployment for process management. The README file also needs to be updated to reflect the new deployment approach.

Current state:
- Unused deploy.sh script in project root
- Docker-related files (Dockerfile, docker-compose.yml, .dockerignore) if present
- README.md with outdated or incomplete deployment instructions

Constraints:
- Must maintain backward compatibility with existing application functionality
- Deployment should support production and development environments
- PM2 ecosystem file should configure proper environment variables and logging

## Goals / Non-Goals

**Goals:**
- Remove all unused deployment artifacts (Docker files, deploy.sh)
- Create PM2 ecosystem configuration for production deployment
- Update README with complete PM2 deployment instructions
- Ensure clean project structure with only necessary files

**Non-Goals:**
- Modifying application source code or functionality
- Setting up CI/CD pipelines (future consideration)
- Implementing monitoring or logging solutions beyond PM2 defaults
- Docker-based deployment (explicitly removing Docker support)

## Decisions

### Decision: PM2 Ecosystem Configuration

**Choice:** Use ecosystem.config.js for PM2 deployment

**Rationale:**
- Standard PM2 approach for defining application configuration
- Supports multiple environments (development, production) via env_section
- Easy to version control and share across team
- Allows fine-grained control over instances, memory limits, and environment variables

**Alternative Considered:** JSON-based ecosystem file
- Ecosystem.js allows more flexibility with comments and environment-specific logic

### Decision: PM2 with Go Backend + React Frontend

**Choice:** Separate PM2 scripts for backend and frontend (if frontend needs separate dev server)

**Rationale:**
- Backend runs as Go binary (single executable)
- Frontend development uses Vite dev server
- Production: Go serves embedded frontend OR frontend built separately
- Current spec shows frontend is embedded in Go binary

### Decision: File Removal Strategy

**Choice:** Delete unused files rather than archiving

**Rationale:**
- Docker files and deploy.sh are completely superseded by PM2
- No migration path needed from old deployment method
- Keeping unused files creates confusion for future developers

## Risks / Trade-offs

[Risk] Application may have environment-specific configuration
→ Mitigation: Document required environment variables in ecosystem.config.js and README

[Risk] PM2 process management unfamiliar to team
→ Mitigation: Include clear instructions in README for common PM2 commands

[Risk] Frontend embedding approach may change
→ Mitigation: Keep PM2 configuration flexible to support different deployment strategies

## Migration Plan

1. Create ecosystem.config.js with backend configuration
2. Remove deploy.sh, Docker files, and related configurations
3. Update README with PM2 deployment instructions
4. Test PM2 startup and verify application functionality
5. Document any environment variables that need to be set

## Open Questions

- Should the frontend be served by PM2 separately (Vite preview) or continue with embedded Go binary approach?
- Does the project require PM2 cluster mode for the Go backend?
- Are there specific environment variables needed for production vs development?
