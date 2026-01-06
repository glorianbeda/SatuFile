# Add PDF Viewer Feature

## Problem
Current file preview doesn't support PDF files. Users need to download PDFs to view them. Server environment may not have native PDF rendering tools available.

## Proposed Solutions

### Option A: Frontend-Only (pdf.js)
Use Mozilla's pdf.js library in the frontend. No server changes needed.

**Pros:**
- No server dependencies
- Works on any deployment
- Fast implementation

**Cons:**
- Large PDFs may be slow to load
- No thumbnail generation for file list

### Option B: Go Backend (unipdf or pdfcpu)
Use Go libraries for server-side PDF processing.

**Libraries:**
- `unipdf/unipdf` - Full PDF manipulation (commercial license for production)
- `pdfcpu/pdfcpu` - Apache licensed, good for basic operations
- `ledongthuc/pdf` - Simple text/image extraction

**Pros:**
- Single binary, no external dependencies
- Fast native performance
- Can generate thumbnails

**Cons:**
- Adds to binary size
- Some libraries have licensing restrictions

### Option C: Node.js Sidecar (pdf-lib or pdfjs-dist)
Run a Node.js service alongside the Go backend.

**Libraries:**
- `pdf-lib` - Pure JS, no native deps
- `pdfjs-dist` - Mozilla's pdf.js for Node

**Pros:**
- Rich ecosystem
- Easier to implement complex features

**Cons:**
- Additional runtime dependency (Node.js)
- More complex deployment

## Recommended Approach

**Hybrid: Frontend pdf.js + Optional Go thumbnails**

1. **Phase 1 (Frontend Only)**
   - Add `pdfjs-dist` to frontend
   - Render PDFs in-browser using canvas
   - Works immediately on all deployments

2. **Phase 2 (Optional Backend)**
   - Add `pdfcpu` (Apache licensed) to Go backend
   - Generate thumbnails for file listing
   - Cache thumbnails for performance

## Implementation Details

### Phase 1: Frontend PDF Viewer

```tsx
// components/files/PdfViewer.tsx
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const PdfViewer = ({ url }: { url: string }) => (
  <Document file={url}>
    <Page pageNumber={1} />
  </Document>
);
```

### Phase 2: Go Thumbnail Generation (Optional)

```go
// Using pdfcpu
import "github.com/pdfcpu/pdfcpu/pkg/api"

func GenerateThumbnail(pdfPath, thumbPath string) error {
    return api.ExtractImagesFile(pdfPath, thumbPath, nil, nil)
}
```

## Dependencies

### Frontend
```json
{
  "react-pdf": "^7.x",
  "pdfjs-dist": "^3.x"
}
```

### Backend (Optional)
```go
require github.com/pdfcpu/pdfcpu v0.5.0
```

## Benefits
- Works on any server without external tools
- Progressive enhancement (thumbnails when backend supports it)
- Fast in-browser rendering
- No licensing issues (Apache/MIT)
