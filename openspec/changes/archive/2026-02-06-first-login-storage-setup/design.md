# First Login Storage Setup - Design

## Context

The current authentication flow allows users to log in with default passwords without any forced setup process. Users also have no guided experience for configuring their cloud storage partition. This creates security vulnerabilities and poor onboarding experience.

**Current State:**
- Login returns JWT token and redirects to home
- No check for default password usage
- Storage partition is configured manually or pre-configured
- No setup wizard or onboarding flow

**Constraints:**
- System runs on Linux (Fedora) server environment
- Backend uses Go with existing JWT auth
- Frontend uses React with existing router
- Database has existing users table

## Goals / Non-Goals

**Goals:**
1. Force password change on first login (when using default password)
2. Detect and display available system drives for user selection
3. Guide users through partition creation with size allocation
4. Block all app features until setup is complete
5. Store setup completion status in user model

**Non-Goals:**
1. Re-partitioning existing storage (only for new setups)
2. Advanced partition management (resizing, moving) - just initial creation
3. Multi-user partition sharing - each user gets their own allocation
4. Cross-platform drive detection (Linux only for now)

## Decisions

### 1. Setup Detection Strategy

**Decision:** Use dual check - `forceSetup` flag OR default password detection

**Rationale:**
- `forceSetup` flag handles cases where setup was interrupted
- Default password detection ensures fresh users with unchanged passwords are caught
- Dual approach covers all edge cases (new users, interrupted setups, admin resets)

**Alternatives considered:**
- Only `forceSetup` flag: Would miss users who never started setup
- Only default password check: Would not re-trigger interrupted setups

### 2. Route Blocking Implementation

**Decision:** Middleware-level check in auth verification

**Rationale:**
- Single point of enforcement, cannot bypass at component level
- Existing JWT middleware already validates tokens
- Adding setup check there ensures ALL protected routes are covered
- Setup routes are whitelisted to prevent redirect loops

**Alternatives considered:**
- Component-level checks: Could be bypassed, violates DRY
- Separate setup middleware: Adds unnecessary complexity

### 3. Drive Detection Implementation

**Decision:** Use Go's `os` package + execute `df` command for detailed info

**Rationale:**
- `os.Executable` and `filepath` give us mount points
- `df -h` provides human-readable sizes and usage percentages
- Reading `/proc/mounts` gives comprehensive mount information
- No external dependencies required

**Alternatives considered:**
- External library: Adds dependency, may not be maintained
- `/sys/block` directly: Too low-level, more complex parsing

### 4. Partition Creation Approach

**Decision:** Create directory structure with size limit enforcement via quota (if available) or soft enforcement

**Rationale:**
- True partitioning requires root privileges and is destructive
- Directory-based approach is safer and reversible
- Can implement soft limits (monitoring) vs hard limits (quotas)
- For MVP: Create directory and track allocated size in user settings

**Technical Details:**
- Create base path: `/data/cloud-storage/<username>/`
- Store allocation size in user settings
- Future enhancement: Implement filesystem quotas for hard limits

### 5. Setup Wizard Flow

**Decision:** 3-step wizard with step validation

**Steps:**
1. **Password Change** - Force password update before proceeding
2. **Drive Selection** - Show available drives with capacity info
3. **Partition Creation** - Select drive and allocate size

**Rationale:**
- Step 1 ensures security first - user must secure account
- Step 2 provides information for informed decision
- Step 3 completes the storage configuration
- Each step validates before allowing next

## Architecture

### Backend Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Auth Middleware                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ - Validate JWT                                         │  │
│  │ - Check setup status (forceSetup flag)                 │  │
│  │ - Redirect to /setup if needed                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Setup Handlers                            │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │ GET /setup/   │  │ POST /setup/  │  │ POST /setup/    │  │
│  │   status      │  │   password    │  │   partition     │  │
│  └───────────────┘  └───────────────┘  └─────────────────┘  │
│  ┌───────────────┐                                              │
│  │ GET /setup/   │                                              │
│  │   drives      │                                              │
│  └───────────────┘                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    System Services                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ DriveDetector                                          │  │
│  │ - Parse /proc/mounts                                   │  │
│  │ - Execute df command                                   │  │
│  │ - Return drive info                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ PartitionManager                                       │  │
│  │ - Create storage directory                            │  │
│  │ - Set permissions                                      │  │
│  │ - Store allocation info                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Components

```
┌─────────────────────────────────────────────────────────────┐
│                    SetupWizard                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Step 1:     │  │ Step 2:     │  │ Step 3:             │  │
│  │ Password    │  │ Drive       │  │ Partition           │  │
│  │ Change      │  │ Selection   │  │ Configuration       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ SetupProgress - shows progress indicator               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Model Changes

```sql
-- Users table - new column
ALTER TABLE users ADD COLUMN force_setup BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN storage_path VARCHAR(255);
ALTER TABLE users ADD COLUMN storage_allocation_gb INTEGER;

-- For tracking drive info (new table for future use)
CREATE TABLE user_storage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    drive_path VARCHAR(255) NOT NULL,
    allocated_gb INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### GET /api/setup/status
Check if user needs to complete setup
**Response:** `{ "required": true, "step": "password" | "drive" | "partition" }`

### GET /api/setup/drives
Get list of available system drives
**Response:** `[{ "device": "/dev/sda1", "mount": "/", "size_gb": 500, "used_gb": 120, "available_gb": 380 }]`

### POST /api/setup/password
Change password during setup
**Request:** `{ "currentPassword": "...", "newPassword": "..." }`

### POST /api/setup/partition
Create storage partition
**Request:** `{ "drive": "/", "size_gb": 100 }`

### POST /api/setup/complete
Mark setup as complete
**Response:** `{ "success": true }`

## Frontend Routes

- `/setup` - Setup wizard entry point
- `/setup/password` - Password change step
- `/setup/drive` - Drive selection step
- `/setup/partition` - Partition configuration step
- `/setup/complete` - Success page

## Risks / Trade-offs

### Risk: Setup Interruption
**Risk:** User closes browser during setup, leaves with incomplete state
**Mitigation:** Store current setup step in user record (`setupStep` field), resume from interrupted step on next login

### Risk: Insufficient Drive Space
**Risk:** User selects allocation larger than available
**Mitigation:** Validate allocation size against available space on selected drive, show clear error message

### Risk: Privilege Escalation via Partition Path
**Risk:** Malicious user could specify paths outside designated storage
**Mitigation:** Validate all paths, ensure storage is created under configured base directory only

### Risk: Default Password Detection Bypass
**Risk:** Timing attacks could reveal default password status
**Mitigation:** Use timing-safe comparison for password checking, return generic error messages

### Trade-off: Soft vs Hard Limits
**Trade-off:** Soft storage limits (monitoring only) vs hard limits (filesystem quotas)
**Decision:** Start with soft limits for MVP (simpler, no root required), add quota support later for production hard limits

## Migration Plan

1. **Database Migration**
   - Add `force_setup` column (default TRUE for existing users)
   - Add `storage_path` and `storage_allocation_gb` columns
   - Existing users will see setup on next login (acceptable as security measure)

2. **Backend Deployment**
   - Deploy new middleware with feature flag
   - Deploy new API endpoints
   - Run database migration

3. **Frontend Deployment**
   - Deploy setup wizard components
   - Update auth flow to check setup status

4. **Rollback Strategy**
   - Feature flag to disable setup requirement
   - Revert middleware changes to allow normal access
   - Database schema is backward compatible (new columns are nullable)

## Open Questions

1. **Should existing admin users bypass setup?**
   - Consideration: Admin users might have different setup needs
   - Resolution: Add admin bypass flag if needed, otherwise all users go through setup

2. **What happens if user runs out of allocated storage?**
   - Consideration: Need clear messaging and upgrade path
   - Resolution: Show storage usage warning at 90%, block uploads at 100%

3. **Should setup allow skipping partition creation?**
   - Consideration: Some users might want to use existing storage
   - Resolution: No - partition creation is mandatory for this flow (enables proper quota tracking)

4. **Support for multiple partitions per user?**
   - Consideration: Advanced users might want to split storage across drives
   - Resolution: Out of scope for MVP, single partition per user
