# Proposal: Add Sidebar, Search, and Trash Features

## Why

The current SatuFile interface lacks navigation structure, making it difficult to access different sections of the application. Users cannot search for files by name, and there is no way to recover accidentally deleted files. Adding a sidebar with storage analysis, a global search feature, and a trash bin will improve user experience and make the application more functional for daily use.

## What Changes

- Add persistent sidebar navigation on the left side of the application
- Add storage analysis page accessible from sidebar showing disk usage by folder
- Add global search bar in header for finding files by filename
- Add trash bin feature for recovering deleted files
- Add "empty trash" functionality to permanently delete all trashed files
- Modify file deletion behavior to move files to trash instead of permanent deletion

## Capabilities

### New Capabilities

- `sidebar-navigation`: Persistent sidebar with navigation links and storage quick view
- `file-search`: Global search functionality for finding files by filename
- `trash-bin`: Recycle bin functionality for deleted files with restore and empty trash

### Modified Capabilities

- `files`: File deletion requirement changes from permanent delete to move to trash

## Impact

- **Frontend**: New sidebar component, search bar in header, storage analysis page, trash page, toast notifications for search/trash actions
- **Backend**: New trash table in database, search endpoint, storage stats endpoint
- **Database**: New tables for trash items and search index (if needed)
- **API**: New endpoints for trash operations, search, and storage statistics
- **Navigation**: New routes for `/storage` and `/trash`
