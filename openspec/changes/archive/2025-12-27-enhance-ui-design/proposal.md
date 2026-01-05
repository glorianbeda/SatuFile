# Change: Enhance UI Design

## Why
The current UI is basic/plain. User wants a clean, modern design following the reference image with Twitter Blue as primary color, featuring professional file management aesthetics.

## Reference
![UI Reference](/home/glo/.gemini/antigravity/brain/3ad2a58d-a1b7-4fe1-96d8-fefaab7be88f/ui_reference.png)

## What Changes
- **Theme**: Update to Twitter Blue (`#1DA1F2`) as primary color with clean gradients
- **Layout**: Redesign with sidebar showing storage usage, main content with file list
- **Header**: Clean search bar, user profile dropdown, action buttons
- **File List**: Modern table with icons, file info, hover effects
- **Sidebar Storage**: Circular progress chart, file type breakdown
- **Upload Modal**: Drag-and-drop zone, supported formats info
- **Recently Modified**: Horizontal card carousel
- **Category Filters**: Colored filter chips (Documents, Image, Video, Audio)

## Impact
- Affected specs: `ui-design` (new capability)
- Affected code: Theme, Layout, new components
- No backend changes

## Design Reference Analysis
From the uploaded image:
1. **Color Palette**: Purple/violet gradient (we'll use Twitter Blue instead)
2. **Typography**: Clean sans-serif, proper hierarchy
3. **Spacing**: Generous whitespace, card-based sections
4. **Icons**: Outlined style, consistent sizing
5. **Shadows**: Subtle elevation on cards
6. **Buttons**: Pill-shaped with gradients for primary actions
