# File Search Specification

## ADDED Requirements

### Requirement: Global Search
The system SHALL provide a global search function to find files by filename.

#### Scenario: Search accessible from header
- **GIVEN** the user is on any page
- **WHEN** user clicks the search icon in the header or presses Ctrl/Cmd+K
- **THEN** a search modal or input SHALL appear

#### Scenario: Search returns results
- **GIVEN** user enters a search query
- **WHEN** the query has at least 2 characters
- **THEN** the system SHALL search for files matching the query
- **AND** results SHALL be displayed in real-time as the user types

#### Scenario: Search result display
- **GIVEN** search results are available
- **WHEN** results are displayed
- **THEN** each result SHALL show: filename, icon (file/folder), and path
- **AND** results SHALL be sorted by modification date (newest first)
- **AND** maximum 10 results SHALL be displayed initially

#### Scenario: Click navigates to file
- **GIVEN** search results are displayed
- **WHEN** user clicks on a result
- **THEN** the system SHALL navigate to the folder containing that file
- **AND** the file SHALL be highlighted or selected in the file list

#### Scenario: Empty search query
- **GIVEN** the search input is empty or has less than 2 characters
- **WHEN** user is viewing the search
- **THEN** no search results SHALL be displayed
- **AND** placeholder text "Search files..." SHALL be shown

#### Scenario: No matching files
- **GIVEN** user enters a search query
- **WHEN** no files match the query
- **THEN** a "No files found" message SHALL be displayed
- **AND** a suggestion to try different keywords MAY be shown

---

### Requirement: Search Behavior
The search function SHALL behave consistently across the application.

#### Scenario: Case-insensitive search
- **GIVEN** user searches for "report"
- **WHEN** files named "Report.pdf", "REPORT.docx", "report.txt" exist
- **THEN** all matching files SHALL be returned

#### Scenario: Partial matching
- **GIVEN** user searches for "doc"
- **WHEN** files named "document.pdf", "docs folder/", "my-doc.docx" exist
- **THEN** all files containing "doc" in the name SHALL be returned

#### Scenario: Search clears on navigation
- **GIVEN** a search is active and results are displayed
- **WHEN** user navigates to a different page
- **THEN** the search input SHALL be cleared
- **AND** no search results SHALL persist to the new page

#### Scenario: Escape closes search
- **GIVEN** the search modal or dropdown is open
- **WHEN** user presses Escape
- **THEN** the search SHALL close
- **AND** focus SHALL return to the previous element

#### Scenario: Keyboard navigation in results
- **GIVEN** search results are displayed
- **WHEN** user uses Arrow Down/Up keys
- **THEN** the selection SHALL move through the results
- **AND** pressing Enter SHALL select the highlighted result

---

### Requirement: Search Performance
The search function SHALL be responsive and not block the user interface.

#### Scenario: Debounced search
- **GIVEN** user is typing a search query
- **WHEN** characters are entered rapidly
- **THEN** the search SHALL be debounced by at least 300ms
- **AND** the UI SHALL remain responsive during typing

#### Scenario: Loading indicator
- **GIVEN** user has entered a search query
- **WHEN** the search is processing
- **THEN** a loading spinner MAY be displayed
- **AND** results SHALL appear without page reload

#### Scenario: Cancel previous search
- **GIVEN** user has entered a search query and results are pending
- **WHEN** user continues typing
- **THEN** previous pending searches SHALL be cancelled
- **AND** only the latest query results SHALL be displayed

---

### Requirement: Search Scope
The search SHALL cover the entire storage visible to the user.

#### Scenario: Search all folders
- **GIVEN** user searches for a filename
- **WHEN** the file exists anywhere in the storage
- **THEN** the search SHALL find the file regardless of its folder location

#### Scenario: Exclude trashed files
- **GIVEN** user searches for a filename
- **WHEN** a file with that name exists in trash
- **THEN** the trashed file SHALL NOT appear in search results
