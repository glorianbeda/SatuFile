import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    CircularProgress,
    Button,
} from '@mui/material';
import { Close, Download, ZoomIn, ZoomOut } from '@mui/icons-material';
import { filesApi } from '../../api';

interface FilePreviewModalProps {
    open: boolean;
    onClose: () => void;
    file: {
        name: string;
        path: string;
        type?: string;
        extension?: string;
    } | null;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
    open,
    onClose,
    file,
}) => {
    const [zoom, setZoom] = useState(1);
    const [mediaSrc, setMediaSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const downloadUrl = file ? filesApi.getDownloadUrl(file.path) : '';
    const ext = file?.extension?.toLowerCase() || file?.name.split('.').pop()?.toLowerCase() || '';

    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
    const isPdf = ext === 'pdf';
    const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext);
    const isVideo = ['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext);
    const isText = ['txt', 'md', 'json', 'yaml', 'yml', 'xml', 'js', 'ts', 'jsx', 'tsx', 'css', 'html', 'go', 'py', 'sh', 'log', 'csv'].includes(ext);
    const [textContent, setTextContent] = useState<string | null>(null);

    // Fetch media with credentials when modal opens
    useEffect(() => {
        if (!open || !file) {
            setMediaSrc(null);
            setLoading(true);
            setError(false);
            setTextContent(null);
            return;
        }

        let isMounted = true;

        const fetchMedia = async () => {
            try {
                setLoading(true);
                setError(false);
                setTextContent(null);

                const token = localStorage.getItem('auth-token');
                const response = await fetch(downloadUrl, {
                    credentials: 'include',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!response.ok) throw new Error('Failed to load');

                // For text files, read as text instead of blob
                if (isText) {
                    const text = await response.text();
                    if (isMounted) {
                        setTextContent(text);
                        setMediaSrc('text'); // Placeholder to indicate content loaded
                        setLoading(false);
                    }
                } else {
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);

                    if (isMounted) {
                        setMediaSrc(objectUrl);
                        setLoading(false);
                    }
                }
            } catch {
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchMedia();

        return () => {
            isMounted = false;
            if (mediaSrc && mediaSrc !== 'text') {
                URL.revokeObjectURL(mediaSrc);
            }
        };
    }, [open, file, downloadUrl, isText]);

    // Reset zoom when file changes
    useEffect(() => {
        setZoom(1);
    }, [file]);

    if (!file) return null;

    const handleDownload = () => {
        if (mediaSrc) {
            const a = document.createElement('a');
            a.href = mediaSrc;
            a.download = file.name;
            a.click();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    maxHeight: '90vh',
                    bgcolor: 'background.paper',
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>
                <Box component="span" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {isImage && (
                        <>
                            <IconButton onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} size="small">
                                <ZoomOut />
                            </IconButton>
                            <IconButton onClick={() => setZoom(z => Math.min(3, z + 0.25))} size="small">
                                <ZoomIn />
                            </IconButton>
                        </>
                    )}
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleDownload}
                        disabled={!mediaSrc}
                        startIcon={<Download />}
                        sx={{ mr: 1 }}
                    >
                        Download
                    </Button>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{
                p: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 400,
                bgcolor: 'background.default',
                overflow: 'auto',
            }}>
                {loading && (
                    <CircularProgress />
                )}

                {error && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="error">
                            Gagal memuat file
                        </Typography>
                    </Box>
                )}

                {!loading && !error && mediaSrc && (
                    <>
                        {isImage && (
                            <Box
                                component="img"
                                src={mediaSrc}
                                alt={file.name}
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: '80vh',
                                    objectFit: 'contain',
                                    transform: `scale(${zoom})`,
                                    transition: 'transform 0.2s',
                                }}
                            />
                        )}

                        {isPdf && (
                            <Box
                                component="iframe"
                                src={mediaSrc}
                                sx={{
                                    width: '100%',
                                    height: '80vh',
                                    border: 'none',
                                }}
                            />
                        )}

                        {isAudio && (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <audio controls autoPlay style={{ width: '100%', maxWidth: 500 }}>
                                    <source src={mediaSrc} />
                                    Your browser does not support audio playback.
                                </audio>
                            </Box>
                        )}

                        {isVideo && (
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <video controls autoPlay style={{ maxWidth: '100%', maxHeight: '70vh' }}>
                                    <source src={mediaSrc} />
                                    Your browser does not support video playback.
                                </video>
                            </Box>
                        )}

                        {isText && textContent && (
                            <Box sx={{
                                p: 2,
                                width: '100%',
                                maxHeight: '70vh',
                                overflow: 'auto',
                                bgcolor: 'grey.900',
                            }}>
                                <pre style={{
                                    margin: 0,
                                    fontFamily: 'monospace',
                                    fontSize: 14,
                                    whiteSpace: 'pre-wrap',
                                    color: '#e0e0e0',
                                }}>
                                    {textContent}
                                </pre>
                            </Box>
                        )}

                        {!isImage && !isPdf && !isAudio && !isVideo && !isText && (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary" gutterBottom>
                                    Preview tidak tersedia untuk file ini
                                </Typography>
                                <Typography variant="body2" color="text.disabled">
                                    Klik tombol Download untuk mengunduh file
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default FilePreviewModal;
