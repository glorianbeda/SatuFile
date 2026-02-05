# files Specification

## MODIFIED Requirements

### Requirement: Delete File or Folder

The system SHALL move deleted files and folders to trash instead of permanent deletion.

#### Scenario: Delete file moves to trash
- **GIVEN** user selects a file and clicks Delete
- **WHEN** delete action is confirmed
- **THEN** the file SHALL be moved to trash
- **AND** the file SHALL be removed from its original location
- **AND** success toast "File moved to trash" SHALL be shown
- **AND** 200 OK SHALL be returned

#### Scenario: Delete folder moves to trash
- **GIVEN** user selects a folder and clicks Delete
- **WHEN** delete action is confirmed
- **THEN** the folder and all contents SHALL be moved to trash
- **AND** the folder SHALL be removed from its original location
- **AND** success toast "Folder moved to trash" SHALL be shown
- **AND** 200 OK SHALL be returned

#### Scenario: Delete Core Folder Rejected
- **GIVEN** user attempts to delete `/Documents`, `/Pictures`, `/Videos`, `/Audio`, or `/Downloads`
- **WHEN** DELETE request is sent
- **THEN** system returns 403 Forbidden
- **AND** error message "Cannot delete protected folder" is returned

#### Scenario: Delete Files Inside Core Folder Allowed
- **GIVEN** user attempts to delete `/Documents/myfile.txt`
- **WHEN** DELETE request is sent
- **THEN** the file is moved to trash
- **AND** success response is returned

#### Scenario: Permanently Delete from Trash
- **GIVEN** user is viewing trash and selects an item
- **WHEN** user confirms permanent delete
- **THEN** the item is permanently deleted from the system
- **AND** there is no way to restore it

---

### Requirement: Trash Operations

The system SHALL provide API endpoints for trash operations.

#### Scenario: Get trash list
- **GIVEN** user is authenticated
- **WHEN** GET /api/trash is called
- **THEN** a list of all trashed items is returned
- **AND** each item includes: id, original_path, deleted_at, file_size, is_directory

#### Scenario: Restore from trash
- **GIVEN** user has an item in trash
- **WHEN** POST /api/trash/{id}/restore is called
- **THEN** the item is restored to its original location
- **AND** the item is removed from trash

#### Scenario: Permanently delete one item
- **GIVEN** user has an item in trash
- **WHEN** DELETE /api/trash/{id} is called
- **THEN** the item is permanently deleted

#### Scenario: Empty all trash
- **GIVEN** user has items in trash
- **WHEN** DELETE /api/trash is called
- **AND** confirmation is provided
- **THEN** all items are permanently deleted
