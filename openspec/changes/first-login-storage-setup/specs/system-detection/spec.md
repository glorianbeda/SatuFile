# system-detection Specification

## Purpose

This specification defines the system drive detection capability that reads available system drives and their storage information for user selection during setup.

## ADDED Requirements

### Requirement: System Drive Detection

The system SHALL detect all available mounted drives on the server and return their storage information.

#### Scenario: Detect available drives

- **GIVEN** system has multiple mounted drives (e.g., `/`, `/home`, `/mnt/data`)
- **WHEN** GET /api/setup/drives is called by authenticated user
- **THEN** response includes array of drives with device path, mount point, total size, used space, and available space

#### Scenario: Response format

- **GIVEN** drives are detected successfully
- **WHEN** response is returned
- **THEN** each drive includes:
  - `device`: Device identifier (e.g., `/dev/sda1`, `/dev/nvme0n1p2`)
  - `mount`: Mount point path (e.g., `/`, `/home`)
  - `size_gb`: Total size in gigabytes
  - `used_gb`: Used space in gigabytes
  - `available_gb`: Available space in gigabytes
  - `usage_percent`: Percentage of space used (0-100)
  - `filesystem`: Filesystem type (e.g., `ext4`, `btrfs`, `xfs`)

#### Scenario: Filter read-only filesystems

- **GIVEN** system has read-only mounts (e.g., `/boot`, `/proc`, `/sys`)
- **WHEN** drives are detected
- **THEN** read-only filesystems are excluded from results
- **AND` only writable mounts are returned

#### Scenario: Filter special filesystems

- **GIVEN** system has special mounts (e.g., `proc`, `sysfs`, `tmpfs`, `devtmpfs`)
- **WHEN** drives are detected
- **THEN** special/pseudo filesystems are excluded from results
- **AND` only physical storage mounts are returned

---

### Requirement: Drive Storage Information

The system SHALL accurately report storage usage information for each detected drive.

#### Scenario: Calculate storage usage

- **GIVEN** a drive has 500 GB total capacity with 120 GB used
- **WHEN** drive information is retrieved
- **THEN** `size_gb` is 500
- **AND` `used_gb` is 120
- **AND` `available_gb` is 380
- **AND` `usage_percent` is 24

#### Scenario: Handle mount points with spaces in path

- **GIVEN** a mount point contains spaces in path (rare but possible)
- **WHEN** drive information is returned
- **THEN** path is properly escaped/quoted in JSON response
- **AND` client can parse the response correctly

---

### Requirement: Drive Selection Validation

The system SHALL validate that a selected drive is suitable for user storage allocation.

#### Scenario: Validate writable drive

- **GIVEN** user selects a drive with mount point `/mnt/data`
- **WHEN** drive is validated for storage allocation
- **THEN** system confirms drive is writable
- **AND` validation passes

#### Scenario: Reject insufficient space

- **GIVEN** user selects a drive with 10 GB available
- **AND` user requests 100 GB allocation
- **WHEN** drive is validated
- **THEN** 400 Bad Request is returned
- **AND` error message indicates insufficient space

#### Scenario: Validate mount point exists

- **GIVEN** user selects a drive from detected list
- **WHEN** partition creation is requested
- **THEN** system verifies mount point still exists
- **AND` proceeds only if mount is valid

---

### Requirement: System Detection Error Handling

The system SHALL handle errors gracefully when drive detection fails.

#### Scenario: Handle permission denied

- **GIVEN** system command to detect drives fails due to permissions
- **WHEN** drive detection is attempted
- **THEN** 500 Internal Server Error is returned
- **AND` error message indicates permission issue

#### Scenario: Handle unexpected output format

- **GIVEN** `df` command returns unexpected output format
- **WHEN** drive detection is attempted
- **THEN** error is logged
- **AND` empty array or meaningful error is returned

---

### Requirement: Drive Information Caching

The system MAY cache drive information for a short duration to improve performance.

#### Scenario: Fresh drive detection

- **GIVEN** no cache exists or cache is expired (5 minutes)
- **WHEN** GET /api/setup/drives is called
- **THEN** system queries actual drive information
- **AND` results are cached

#### Scenario: Cached drive information

- **GIVEN** cache exists and is not expired
- **WHEN** GET /api/setup/drives is called
- **THEN** cached results are returned
- **AND` system query is not executed
