# storage-partition Specification

## Purpose

This specification defines the storage partition creation and management capability for allocating user cloud storage on selected drives.

## ADDED Requirements

### Requirement: Storage Partition Creation

The system SHALL allow users to create a storage partition on a selected drive with specified size allocation.

#### Scenario: Create partition successfully

- **GIVEN** user has selected drive `/mnt/data` with 500 GB available
- **AND` user specifies 100 GB allocation
- **WHEN** POST /api/setup/partition is called with `{ "drive": "/mnt/data", "size_gb": 100 }`
- **THEN** directory structure is created at `/mnt/data/cloud-storage/<username>/`
- **AND` user record is updated with `storage_path` and `storage_allocation_gb`
- **AND` 201 Created is returned with partition details

#### Scenario: Validate allocation size

- **GIVEN** user specifies allocation size
- **WHEN** partition creation is requested
- **THEN** size_gb must be at least 1 GB
- **AND` size_gb must not exceed available space on selected drive

#### Scenario: Reject invalid allocation size

- **GIVEN** user specifies 0 GB or negative size
- **WHEN** POST /api/setup/partition is called
- **THEN** 400 Bad Request is returned
- **AND` error message indicates minimum size requirement

#### Scenario: Reject insufficient space

- **GIVEN** selected drive has 50 GB available
- **AND` user requests 100 GB allocation
- **WHEN** POST /api/setup/partition is called
- **THEN** 400 Bad Request is returned
- **AND` error message indicates insufficient space

---

### Requirement: Storage Path Security

The system SHALL ensure storage paths are secure and prevent directory traversal attacks.

#### Scenario: Validate path is under selected drive

- **GIVEN** user selects drive `/mnt/data`
- **WHEN** partition path is created
- **THEN** final path is `/mnt/data/cloud-storage/<username>/`
- **AND` path cannot escape outside selected drive
- **AND` any attempt to use `../` in username is sanitized

#### Scenario: Set appropriate permissions

- **GIVEN** partition directory is created
- **WHEN** directory creation completes
- **THEN** directory has permissions 750 (owner rwx, group rx, others none)
- **AND` directory is owned by the system service user
- **AND` group allows appropriate access for file operations

#### Scenario: Sanitize username in path

- **GIVEN** username contains special characters or could be malicious
- **WHEN** partition path is created
- **THEN** username is sanitized to prevent path traversal
- **AND` only safe characters are used in directory name

---

### Requirement: Partition Storage Information

The system SHALL store and retrieve partition information for each user.

#### Scenario: Store partition details

- **GIVEN** user creates partition successfully
- **WHEN** partition is created
- **THEN** `storage_path` is saved in users table
- **AND` `storage_allocation_gb` is saved in users table
- **AND` partition creation timestamp is recorded

#### Scenario: Retrieve partition details

- **GIVEN** user has existing partition
- **WHEN** GET /api/user/storage is called
- **THEN** response includes:
  - `storage_path`: Path to user's storage
  - `storage_allocation_gb`: Allocated size in GB
  - `storage_used_gb`: Actual used space
  - `storage_available_gb`: Remaining allocation

---

### Requirement: Storage Usage Monitoring

The system SHALL monitor actual storage usage against allocated quota.

#### Scenario: Calculate storage usage

- **GIVEN** user has 100 GB allocated partition
- **AND` user has stored 25 GB of files
- **WHEN** storage usage is calculated
- **THEN** `storage_used_gb` is 25
- **AND` `storage_available_gb` is 75

#### Scenario: Show storage warning at threshold

- **GIVEN** user has allocated 100 GB
- **AND` user has used 90 GB (90% threshold)
- **WHEN** user views storage information
- **THEN** warning message is displayed
- **AND` user is alerted to near-full storage

#### Scenario: Block uploads when quota exceeded

- **GIVEN** user has allocated 100 GB
- **AND` user has used 100 GB (quota full)
- **WHEN** user attempts to upload a file
- **THEN** 507 Insufficient Storage is returned
- **AND` error message indicates quota exceeded

---

### Requirement: Partition Creation UI

The system SHALL provide a user interface for selecting drive and allocating storage size.

#### Scenario: Display drive selector

- **GIVEN** user is on partition configuration step
- **WHEN** step loads
- **THEN** available drives are displayed with:
  - Drive name/mount point
  - Total capacity
  - Available space
  - Visual usage bar

#### Scenario: Display size input with recommendations

- **GIVEN** user is on partition configuration step
- **WHEN** step loads
- **THEN** size input is displayed with:
  - Current value (default: 50% of available space)
  - Slider for visual adjustment
  - Minimum: 1 GB
  - Maximum: Available space on selected drive
  - Recommended: 50-100 GB for typical use

#### Scenario: Show partition preview

- **GIVEN** user has selected drive and size
- **WHEN** user reviews before creation
- **THEN** preview displays:
  - Selected drive path
  - Allocation size
  - Full storage path
  - Space remaining on drive after allocation

#### Scenario: Validate before submission

- **GIVEN** user enters invalid size or hasn't selected drive
- **WHEN** user clicks "Create Partition"
- **THEN** submit button is disabled
- **AND` validation errors are shown
- **AND` button is enabled only when all inputs are valid

---

### Requirement: Partition Creation Error Handling

The system SHALL handle errors during partition creation gracefully.

#### Scenario: Handle disk write failure

- **GIVEN** disk write fails during directory creation
- **WHEN** partition creation is attempted
- **THEN** 500 Internal Server Error is returned
- **AND` user-friendly error message is displayed
- **AND` user can retry creation

#### Scenario: Handle concurrent creation attempts

- **GIVEN** user already has a partition created
- **WHEN** another POST /api/setup/partition is called
- **THEN** 409 Conflict is returned
- **AND` error message indicates partition already exists

---

### Requirement: Directory Initialization

The system SHALL initialize the storage partition with default subdirectories.

#### Scenario: Create default folders

- **GIVEN** partition is created successfully
- **WHEN** initialization runs
- **THEN** default folders are created:
  - `/Documents`
  - `/Pictures`
  - `/Videos`
  - `/Audio`
  - `/Downloads`

#### Scenario: Create README in storage root

- **GIVEN** partition is created
- **WHEN** initialization runs
- **THEN** README.txt is created in storage root
- **AND` file contains information about storage usage and limits
