# Trash Bin Specification

## ADDED Requirements

### Requirement: Trash Bin Page
The system SHALL provide a dedicated page for viewing and managing trashed items.

#### Scenario: Access trash page
- **GIVEN** user is authenticated
- **WHEN** user clicks "Trash" in the sidebar
- **THEN** navigation to the trash page SHALL occur
- **AND** the page SHALL display all items in the trash

#### Scenario: Trash page content
- **GIVEN** the trash page is displayed
- **WHEN** user views the page
- **THEN** a list of trashed items SHALL be visible
- **AND** each item SHALL show: name, original location, deletion date
- **AND** an "Empty Trash" button SHALL be present

#### Scenario: Empty trash button
- **GIVEN** the trash page is displayed
- **WHEN** user clicks "Empty Trash"
- **THEN** a confirmation dialog SHALL appear
- **AND** confirming SHALL permanently delete all items

#### Scenario: Select all items
- **GIVEN** the trash page is displayed
- **WHEN** user clicks "Select All" checkbox
- **THEN** all items in the trash SHALL be selected
- **AND** a "Delete Selected" option SHALL appear

---

### Requirement: Delete Moves to Trash
The system SHALL move deleted files to trash instead of permanent deletion.

#### Scenario: Delete file moves to trash
- **GIVEN** user deletes a file from the file browser
- **WHEN** the delete action is confirmed
- **THEN** the file SHALL be moved to trash
- **AND** the file SHALL be removed from its original location
- **AND** a success toast SHALL display "File moved to trash"

#### Scenario: Delete folder moves to trash
- **GIVEN** user deletes a folder from the file browser
- **WHEN** the delete action is confirmed
- **THEN** the folder and all its contents SHALL be moved to trash
- **AND** the folder SHALL be removed from its original location
- **AND** a success toast SHALL display "Folder moved to trash"

#### Scenario: Delete in trash permanently removes
- **GIVEN** user is viewing the trash page
- **WHEN** user deletes an item from trash
- **THEN** the item SHALL be permanently deleted
- **AND** there SHALL be no way to restore it

#### Scenario: Protected folders not deletable
- **GIVEN** user attempts to delete Documents, Pictures, Videos, Audio, or Downloads
- **WHEN** delete action is triggered
- **THEN** the system SHALL return 403 Forbidden
- **AND** error message "Cannot delete protected folder" SHALL be shown

---

### Requirement: Restore from Trash
The system SHALL allow users to restore items from trash to their original location.

#### Scenario: Restore single item
- **GIVEN** user is viewing the trash page
- **WHEN** user clicks the restore icon on an item
- **THEN** the item SHALL be restored to its original location
- **AND** the item SHALL be removed from trash
- **AND** a success toast SHALL display "Item restored"

#### Scenario: Restore multiple items
- **GIVEN** user has selected multiple items in trash
- **WHEN** user clicks "Restore Selected"
- **THEN** all selected items SHALL be restored to their original locations
- **AND** a success toast SHALL display "X items restored"

#### Scenario: Restore to same-named folder
- **GIVEN** user has a file "report.pdf" in trash
- **AND** a new file with the same name exists at the original location
- **WHEN** user restores the trashed file
- **THEN** the system SHALL either rename the restored file or show a conflict dialog
- **AND** the user SHALL be able to choose to keep both or replace

#### Scenario: Restore nested folder structure
- **GIVEN** user has a nested folder "/Documents/Projects/Old/" in trash
- **WHEN** user restores the folder
- **THEN** the entire folder structure SHALL be restored
- **AND** all files within SHALL be restored to their original relative paths

---

### Requirement: Permanent Delete
The system SHALL allow permanent deletion of items from trash.

#### Scenario: Permanent delete single item
- **GIVEN** user is viewing the trash page
- **WHEN** user clicks delete icon on an item
- **THEN** a confirmation dialog SHALL appear
- **AND** confirming SHALL permanently delete the item
- **AND** the item SHALL be unrecoverable

#### Scenario: Empty all trash
- **GIVEN** user is viewing the trash page
- **WHEN** user clicks "Empty Trash" and confirms
- **THEN** all items in trash SHALL be permanently deleted
- **AND** the trash SHALL be empty afterward
- **AND** a success toast SHALL display "Trash emptied"

#### Scenario: Cannot restore permanently deleted
- **GIVEN** an item has been permanently deleted
- **WHEN** user attempts to find or restore it
- **THEN** the item SHALL not be accessible
- **AND** there SHALL be no way to recover it from the system

---

### Requirement: Trash Persistence
Trashed items SHALL be retained for a limited time.

#### Scenario: Trash retention period
- **GIVEN** an item has been in trash for 30 days
- **WHEN** the retention period expires
- **THEN** the item SHALL be automatically permanently deleted

#### Scenario: Display deletion date
- **GIVEN** user is viewing the trash page
- **WHEN** items are displayed
- **THEN** each item SHALL show its deletion date
- **AND** items approaching expiration MAY be highlighted

#### Scenario: Trash item count
- **GIVEN** user is viewing the sidebar
- **WHEN** there are items in trash
- **THEN** the trash navigation item MAY show a badge with item count
- **AND** the number SHALL update as items are added or removed
