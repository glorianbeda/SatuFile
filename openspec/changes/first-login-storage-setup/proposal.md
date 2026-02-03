# First Login Storage Setup - Proposal

## Why

New users with default passwords are vulnerable to security threats, and the system currently lacks a forced onboarding flow to ensure users properly configure their cloud storage before accessing features. This change addresses both security (password change enforcement) and usability (guided storage partition setup) by creating a mandatory first-time setup experience.

## What Changes

- Add a `forceSetup` flag to user model to track if user has completed initial setup
- Detect if user is logging in with default password OR has `forceSetup: true`
- Block access to all routes except setup flow when setup is required
- Create a multi-step setup wizard that:
  - Forces password change before proceeding
  - Detects and displays all available system drives with storage information
  - Allows user to select a drive and allocate storage partition size
  - Validates partition creation before allowing exit
- Add API endpoints for:
  - Detecting available system drives
  - Creating/configuring storage partitions
  - Marking setup as complete
- Create setup wizard UI components with step-by-step flow
- Add middleware to protect routes and redirect to setup when needed

## Capabilities

### New Capabilities

- `first-login-setup`: Forced onboarding flow for new users with password change and storage partition configuration

- `system-detection`: Backend capability to detect available system drives and their storage information

- `storage-partition`: Storage partition creation and management for allocating user cloud storage

### Modified Capabilities

- `authentication`: Add detection for default password/login-first-time status to trigger setup flow
  - New requirement: System SHALL detect when user logs in with default password OR has `forceSetup: true`
  - New requirement: System SHALL redirect to setup flow and block all other routes until setup is complete

- `settings`: Integrate setup completion status with settings
  - New requirement: Settings API SHALL return whether user has completed initial setup

## Impact

### Affected Code

- **Backend (Go)**:
  - User model: Add `forceSetup` boolean field
  - Auth middleware: Check setup status and block access
  - New API handlers: `/api/setup/drives`, `/api/setup/partition`, `/api/setup/complete`
  - System integration: OS-level drive detection (Linux: `/proc/mounts`, `df` command)

- **Frontend (React)**:
  - New routes: `/setup/*` for setup wizard
  - New components: SetupWizard, SetupProgress, DriveSelector, PartitionForm
  - Auth flow modification: Check setup status on login and redirect

- **Database**:
  - Users table migration: Add `force_setup` column

### Dependencies

- Node.js modules: None additional (existing fs/child_process for drive info)
- Go packages: `os`, `syscall` for drive detection

### Security Considerations

- Default password detection must use timing-safe comparison
- Setup routes must be protected from bypass
- Partition creation must validate paths to prevent directory traversal
- User must not be able to skip setup flow
