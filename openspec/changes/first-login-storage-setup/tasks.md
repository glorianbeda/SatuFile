# First Login Storage Setup - Implementation Tasks

## 1. Database Schema

- [x] 1.1 Add `force_setup` column to users table (BOOLEAN, default TRUE)
- [x] 1.2 Add `setup_step` column to users table (VARCHAR, default 'password')
- [x] 1.3 Add `is_default_password` column to users table (BOOLEAN, default TRUE)
- [x] 1.4 Add `storage_path` column to users table (VARCHAR, nullable)
- [x] 1.5 Add `storage_allocation_gb` column to users table (INTEGER, nullable)
- [x] 1.6 Create migration file for schema changes
- [x] 1.7 Run migration and verify schema updates

## 2. Backend - User Model

- [x] 2.1 Update User struct to include new fields (ForceSetup, SetupStep, IsDefaultPassword, StoragePath, StorageAllocationGb)
- [x] 2.2 Update database queries to select new fields
- [x] 2.3 Update user creation to set default values for new fields

## 3. Backend - Auth Middleware

- [x] 3.1 Add setup status check to JWT validation middleware
- [x] 3.2 Implement redirect logic for users with forceSetup=true
- [x] 3.3 Create whitelist of routes that bypass setup check (/setup/*, /api/setup/*)
- [x] 3.4 Add setupRequired flag to login response

## 4. Backend - Setup API Endpoints

- [x] 4.1 Implement GET /api/setup/status - returns setup requirement and current step
- [x] 4.2 Implement POST /api/setup/password - validates and updates password during setup
- [x] 4.3 Add isDefaultPassword flag clearing on password change
- [x] 4.4 Implement GET /api/setup/drives - returns available system drives
- [x] 4.5 Create DriveDetector service - parse /proc/mounts and execute df command
- [x] 4.6 Filter out read-only and special filesystems from drive list
- [x] 4.7 Implement POST /api/setup/partition - creates storage directory
- [x] 4.8 Create PartitionManager service - handle directory creation and permissions
- [x] 4.9 Add validation for partition size (minimum 1GB, maximum available space)
- [x] 4.10 Implement POST /api/setup/complete - marks setup as done
- [x] 4.11 Update user record with storage_path and storage_allocation_gb on partition creation

## 5. Backend - System Services

- [x] 5.1 Create system/detection package for drive detection
- [x] 5.2 Implement GetDrives() function - reads /proc/mounts
- [x] 5.3 Execute df command to get storage usage information
- [x] 5.4 Parse df output and format as JSON
- [x] 5.5 Create system/partition package for partition management
- [x] 5.6 Implement CreatePartition() function - creates directory structure
- [x] 5.7 Set directory permissions (750)
- [x] 5.8 Sanitize usernames to prevent path traversal attacks
- [x] 5.9 Create default folders (Documents, Pictures, Videos, Audio, Downloads)
- [x] 5.10 Create README.txt in storage root

## 6. Backend - Storage Monitoring

- [x] 6.1 Implement storage usage calculation for user partitions
- [x] 6.2 Create GET /api/user/storage endpoint
- [x] 6.3 Return storage_path, storage_allocation_gb, used_gb, available_gb
- [x] 6.4 Add 90% usage warning logic

## 7. Backend - Settings Integration

- [x] 7.1 Update GET /api/settings to include setup status
- [x] 7.2 Add storage information object to settings response
- [x] 7.3 Handle null storage values for users who haven't completed setup

## 8. Frontend - Setup Routes

- [x] 8.1 Add /setup route to router configuration
- [x] 8.2 Add /setup/password sub-route
- [x] 8.3 Add /setup/drive sub-route
- [x] 8.4 Add /setup/partition sub-route
- [x] 8.5 Add /setup/complete sub-route

## 9. Frontend - Setup Wizard Component

- [x] 9.1 Create SetupWizard main component
- [x] 9.2 Create SetupProgress component - shows step indicator with checkmarks
- [x] 9.3 Implement step state management (current step, completed steps)
- [x] 9.4 Add step navigation (Next, Back buttons)
- [x] 9.5 Disable Next button until current step is valid
- [x] 9.6 Prevent navigation to future steps without completing current step

## 10. Frontend - Password Step

- [x] 10.1 Create PasswordSetupStep component
- [x] 10.2 Add current password input field
- [x] 10.3 Add new password input field
- [x] 10.4 Add confirm password input field
- [x] 10.5 Implement password matching validation
- [x] 10.6 Implement password strength validation (min 8 chars)
- [x] 10.7 Call POST /api/setup/password on form submit
- [x] 10.8 Show error messages for failed password change
- [x] 10.9 Advance to drive step on success

## 11. Frontend - Drive Selection Step

- [x] 11.1 Create DriveSelectionStep component
- [x] 11.2 Call GET /api/setup/drives on mount
- [x] 11.3 Display drive cards with device, mount point, size, usage
- [x] 11.4 Add visual usage bar for each drive
- [x] 11.5 Implement drive selection state
- [x] 11.6 Highlight selected drive card
- [x] 11.7 Show only writable drives (filter out read-only)
- [x] 11.8 Handle loading and error states
- [x] 11.9 Pass selected drive to partition step

## 12. Frontend - Partition Step

- [x] 12.1 Create PartitionSetupStep component
- [x] 12.2 Display selected drive information
- [x] 12.3 Add size input field (number)
- [x] 12.4 Add size slider for visual adjustment
- [x] 12.5 Set minimum to 1 GB
- [x] 12.6 Set maximum to available space on selected drive
- [x] 12.7 Set default to 50% of available space
- [x] 12.8 Display partition preview (drive, size, full path)
- [x] 12.9 Validate size before enabling submit
- [x] 12.10 Call POST /api/setup/partition on form submit
- [x] 12.11 Show error for insufficient space
- [x] 12.12 Show success message and advance to complete

## 13. Frontend - Complete Step

- [x] 13.1 Create SetupCompleteStep component
- [x] 13.2 Display success message
- [x] 13.3 Show summary of what was configured
- [x] 13.4 Add "Continue to App" button
- [x] 13.5 Call POST /api/setup/complete on button click
- [x] 13.6 Redirect to home page after completion

## 14. Frontend - Auth Flow Integration

- [x] 14.1 Update login handler to check setupRequired flag
- [x] 14.2 Redirect to /setup if setupRequired is true
- [x] 14.3 Redirect to home if setupRequired is false
- [x] 14.4 Add setup check on app mount (for returning users)

## 15. Frontend - Protected Routes

- [x] 15.1 Create setup guard middleware for frontend routes
- [x] 15.2 Check /api/setup/status on protected route access
- [x] 15.3 Redirect to /setup if setup is required
- [x] 15.4 Whitelist /setup routes to prevent redirect loops

## 16. Frontend - Settings Integration

- [x] 16.1 Update settings page to display setup status
- [x] 16.2 Add "Complete Setup" link/badge if setup incomplete
- [x] 16.3 Add storage information section to settings
- [x] 16.4 Display storage allocation, used, available
- [x] 16.5 Add visual storage usage bar
- [x] 16.6 Show warning when storage is 90%+ full
- [x] 16.7 Handle null storage values gracefully

## 17. Frontend - Error Handling

- [x] 17.1 Add error boundary for setup wizard
- [x] 17.2 Handle network errors with retry option
- [x] 17.3 Handle permission errors for drive detection
- [x] 17.4 Handle disk write errors for partition creation
- [x] 17.5 Show user-friendly error messages throughout

## 18. Testing

- [x] 18.1 Test setup flow from login to completion
- [x] 18.2 Test resume setup from password step
- [x] 18.3 Test resume setup from drive step
- [x] 18.4 Test resume setup from partition step
- [x] 18.5 Test validation errors (weak password, insufficient space)
- [x] 18.6 Test route blocking (verify other routes redirect to setup)
- [x] 18.7 Test setup whitelist routes (/setup/* accessible)
- [x] 18.8 Test storage quota enforcement (block uploads at 100%)
- [x] 18.9 Test drive detection with multiple drives
- [x] 18.10 Test settings display of storage information
