import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
    Box,
    IconButton,
    Typography,
    CircularProgress,
    Stack,
} from "@mui/material";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    RotateRight,
} from "@mui/icons-material";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    url: string;
    onError?: (error: Error) => void;
}

export const PdfViewer = ({ url, onError }: PdfViewerProps) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [rotation, setRotation] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const onDocumentLoadError = (error: Error) => {
        setLoading(false);
        onError?.(error);
    };

    const goToPrevPage = () => {
        setPageNumber((prev) => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setPageNumber((prev) => Math.min(prev + 1, numPages));
    };

    const zoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 3.0));
    };

    const zoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 0.5));
    };

    const rotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                bgcolor: "background.paper",
            }}
        >
            {/* Toolbar */}
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="center"
                sx={{
                    p: 1,
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "background.default",
                }}
            >
                <IconButton onClick={goToPrevPage} disabled={pageNumber <= 1}>
                    <ChevronLeft />
                </IconButton>
                <Typography variant="body2">
                    {pageNumber} / {numPages}
                </Typography>
                <IconButton onClick={goToNextPage} disabled={pageNumber >= numPages}>
                    <ChevronRight />
                </IconButton>

                <Box sx={{ mx: 2, borderLeft: 1, borderColor: "divider", height: 24 }} />

                <IconButton onClick={zoomOut} disabled={scale <= 0.5}>
                    <ZoomOut />
                </IconButton>
                <Typography variant="body2" sx={{ minWidth: 50, textAlign: "center" }}>
                    {Math.round(scale * 100)}%
                </Typography>
                <IconButton onClick={zoomIn} disabled={scale >= 3.0}>
                    <ZoomIn />
                </IconButton>

                <Box sx={{ mx: 2, borderLeft: 1, borderColor: "divider", height: 24 }} />

                <IconButton onClick={rotate}>
                    <RotateRight />
                </IconButton>
            </Stack>

            {/* Document */}
            <Box
                sx={{
                    flex: 1,
                    overflow: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    p: 2,
                    bgcolor: "#525659",
                }}
            >
                {loading && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={null}
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        rotate={rotation}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                    />
                </Document>
            </Box>
        </Box>
    );
};

export default PdfViewer;
