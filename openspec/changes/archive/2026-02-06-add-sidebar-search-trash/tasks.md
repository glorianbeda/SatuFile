# Tasks: Add Sidebar, Search, and Trash Features

## 1. Backend - Trash Database and API

- [x] 1.1 Create trash table migration (id, original_path, deleted_at, file_size, is_directory)
- [x] 1.2 Implement DELETE /api/resources/{path} to move to trash instead of permanent delete
- [x] 1.3 Implement GET /api/trash - list all trashed items
- [x] 1.4 Implement POST /api/trash/{id}/restore - restore single item
- [x] 1.5 Implement DELETE /api/trash/{id} - permanently delete single item
- [x] 1.6 Implement DELETE /api/trash - empty all trash
- [x] 1.7 Add trash count to user response

## 2. Backend - Search API

- [x] 2.1 Implement GET /api/search?q={query} - search files by name
- [x] 2.2 Add case-insensitive LIKE search
- [x] 2.3 Add LIMIT 50 to search results
- [x] 2.4 Exclude trashed items from search results

## 3. Backend - Storage API

- [x] 3.1 Implement GET /api/storage/stats - get storage breakdown by folder
- [x] 3.2 Implement GET /api/storage/usage - get total used/free space
- [x] 3.3 Add caching (5 minutes) for storage stats

## 4. Frontend - Sidebar Component

- [x] 4.1 Create Sidebar component structure
- [x] 4.2 Add navigation items (Files, Documents, Pictures, Videos, Audio, Downloads)
- [x] 4.3 Add collapsible/expandable functionality
- [x] 4.4 Integrate sidebar with main layout (adjust content margin)

## 5. Frontend - Search Component

- [x] 5.1 Create SearchInput component
- [x] 5.2 Add debounced API call (300ms)
- [x] 5.3 Create search results dropdown
- [x] 5.4 Add keyboard navigation (Arrow keys, Enter, Escape)
- [x] 5.5 Connect to header search icon

## 6. Frontend - Storage Indicator

- [x] 6.1 Create StorageIndicator component with progress bar
- [x] 6.2 Add click to navigate to Storage page
- [x] 6.3 Implement color changes based on usage (green < 80%, orange/red >= 80%)

## 7. Frontend - Storage Analysis Page

- [x] 7.1 Create StoragePage component
- [x] 7.2 Implement storage breakdown display (folder names with sizes)
- [x] 7.3 Add progress bars for each folder
- [x] 7.4 Create routes.tsx entry for /storage

## 8. Frontend - Trash Page

- [x] 8.1 Create TrashPage component
- [x] 8.2 Implement trash list display (name, original path, deleted date)
- [x] 8.3 Add select all / select individual items
- [x] 8.4 Add restore action for single/multiple items
- [x] 8.5 Add permanent delete action
- [x] 8.6 Add Empty Trash button with confirmation dialog
- [x] 8.7 Create routes.tsx entry for /trash

## 9. Frontend - Toast Notifications

- [x] 9.1 Add toast for "File moved to trash"
- [x] 9.2 Add toast for "Item restored"
- [x] 9.3 Add toast for "Trash emptied"
- [x] 9.4 Add toast for search results count

## 10. Integration and Testing

- [x] 10.1 Test trash move/restore flow end-to-end
- [x] 10.2 Test search returns correct results
- [x] 10.3 Test storage calculation accuracy
- [x] 10.4 Test sidebar collapse/expand
- [x] 10.5 Test responsive design (mobile sidebar behavior)
- [x] 10.6 Update README with new features documentation