# Design: Navigation and Protected Folders

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Breadcrumb  │  │ FolderToolbar│ │  FileList   │  │
│  │ Home > Docs │  │ ◀ Back | Sort│ │             │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                    Backend                           │
│  ┌─────────────────────────────────────────────┐    │
│  │ resources.delete.go                          │    │
│  │ - Check if target is core folder             │    │
│  │ - Return 403 if protected                    │    │
│  └─────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────┐    │
│  │ Startup Hook                                 │    │
│  │ - Create core folders if not exist           │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│               Storage (./data)                       │
│  ├── Documents/   (protected)                        │
│  ├── Pictures/    (protected)                        │
│  ├── Videos/      (protected)                        │
│  ├── Audio/       (protected)                        │
│  └── Downloads/   (protected)                        │
└─────────────────────────────────────────────────────┘
```

## Core Folders Protection

```go
var CoreFolders = []string{
    "Documents",
    "Pictures",
    "Videos",
    "Audio",
    "Downloads",
}

func IsCoreFolder(path string) bool {
    cleanPath := strings.Trim(path, "/")
    for _, folder := range CoreFolders {
        if cleanPath == folder {
            return true
        }
    }
    return false
}
```

## Docker Compose

```yaml
version: '3.8'
services:
  satufile:
    image: satufile:latest
    ports:
      - "8080:8080"
    volumes:
      - ./data:/data
    environment:
      - SATUFILE_ROOT=/data
```
