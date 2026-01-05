# Capability: UI Design

## ADDED Requirements

### Requirement: Twitter Blue Theme
The system SHALL use Twitter Blue (#1DA1F2) as the primary color with a cohesive palette including lighter and darker variants for hover states and accents.

#### Scenario: Theme applies Twitter Blue
- **GIVEN** the application loads
- **WHEN** the ThemeProvider initializes
- **THEN** primary color is #1DA1F2 across all components

#### Scenario: Dark mode maintains brand color
- **GIVEN** user toggles dark mode
- **WHEN** theme switches
- **THEN** primary color remains Twitter Blue with adjusted backgrounds

---

### Requirement: Modern Layout Structure
The system SHALL display a three-section layout with:
- Top header (search, actions, profile)
- Main content area (files)
- Right sidebar (storage usage)

#### Scenario: Layout renders correctly
- **GIVEN** user accesses the home page
- **WHEN** the page loads
- **THEN** header, main content, and storage sidebar are visible

#### Scenario: Responsive collapse
- **GIVEN** viewport width is less than 768px
- **WHEN** layout renders
- **THEN** sidebar collapses to bottom or hides

---

### Requirement: Storage Usage Display
The system SHALL show storage usage with a circular progress chart and breakdown by file type (Documents, Images, Videos, Audio, ZIP).

#### Scenario: Storage chart displays
- **GIVEN** user is on home page
- **WHEN** storage panel loads
- **THEN** circular chart shows used/total storage with file type breakdown

---

### Requirement: File List Table
The system SHALL display files in a modern table with columns for checkbox, icon, name, owner, size, date, and actions menu.

#### Scenario: File list renders
- **GIVEN** files exist
- **WHEN** file list component loads
- **THEN** each file shows icon, name, owner, size, date with hover effect

---

### Requirement: Category Filter Chips
The system SHALL provide colored filter chips for file categories (Documents, Image, Video, etc.) with a progress bar showing relative usage.

#### Scenario: Filter chips display
- **GIVEN** user is on home page
- **WHEN** category section loads
- **THEN** colored chips for each category are visible with usage bars

---

### Requirement: Upload Modal
The system SHALL provide an upload modal with drag-and-drop zone, supported formats info, and a gradient Continue button.

#### Scenario: Upload modal opens
- **GIVEN** user clicks "Upload file" button
- **WHEN** modal opens
- **THEN** drag-and-drop zone with dashed border appears
