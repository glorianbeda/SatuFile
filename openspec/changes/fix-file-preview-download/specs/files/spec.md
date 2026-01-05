# files Specification Deltas

## Purpose
Fix file preview and download behavior to improve performance and user experience.

## MODIFIED Requirements

### Requirement: File Download

The system SHALL provide file download functionality via direct file download.

#### Scenario: Direct Download from Context Menu

- **GIVEN** user clicks Download in context menu
- **WHEN** download action is triggered
- **THEN** file is downloaded directly (not opened in new tab)
- **AND** browser download prompt appears
- **AND** file is saved with original filename

#### Scenario: Direct Download from Preview Modal

- **GIVEN** user clicks Download button in preview modal
- **WHEN** download button is clicked
- **THEN** file is downloaded directly
- **AND** modal remains open

---

### Requirement: File Preview Modal

The system SHALL display file previews in a modal for supported media types only.

#### Scenario: Preview Image

- **GIVEN** user clicks on an image file (jpg, jpeg, png, gif, webp, svg, bmp)
- **WHEN** preview modal opens
- **THEN** image is displayed in modal

#### Scenario: Preview PDF

- **GIVEN** user clicks on a PDF file
- **WHEN** preview modal opens
- **THEN** PDF is embedded and viewable

#### Scenario: Preview Audio/Video

- **GIVEN** user clicks on audio/video file
  - **AND** extension is mp4, webm, avi, mov, mkv (video)
  - **OR** extension is mp3, wav, ogg, m4a, flac (audio)
- **WHEN** preview modal opens
- **THEN** HTML5 player is shown

#### Scenario: No Preview for Text Files

- **GIVEN** user clicks on text file (txt, md, log, csv)
- **WHEN** file is clicked
- **THEN** preview modal does NOT open
- **AND** no preview option appears in context menu

#### Scenario: No Preview for Code Files

- **GIVEN** user clicks on code file (js, ts, jsx, tsx, html, css, go, py, sh)
- **WHEN** file is clicked
- **THEN** preview modal does NOT open
- **AND** no preview option appears in context menu

#### Scenario: No Preview for Config Files

- **GIVEN** user clicks on config file (json, yaml, xml, yml)
- **WHEN** file is clicked
- **THEN** preview modal does NOT open
- **AND** no preview option appears in context menu

#### Scenario: Context Menu Shows Only Download for Non-Previewable

- **GIVEN** user opens context menu on non-previewable file
- **WHEN** menu opens
- **THEN** only Download, Rename, Delete options are shown
- **AND** Preview option is NOT shown

#### Scenario: Context Menu Shows Preview for Previewable

- **GIVEN** user opens context menu on previewable file (image, video, audio, pdf)
- **WHEN** menu opens
- **THEN** Preview, Download, Rename, Delete options are shown
- **AND** Preview option appears first
