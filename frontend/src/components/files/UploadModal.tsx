import React, { useState, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Button,
} from '@mui/material';
import { Close, CloudUpload } from '@mui/icons-material';

interface UploadModalProps {
    open: boolean;
    onClose: () => void;
    onUpload?: (files: File[]) => void;
    isFolder?: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
    open,
    onClose,
    onUpload,
    isFolder = false,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles((prev) => [...prev, ...droppedFiles]);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...selectedFiles]);
        }
    };

    const handleContinue = () => {
        if (onUpload && files.length > 0) {
            onUpload(files);
        }
        setFiles([]);
        onClose();
    };

    const handleClose = () => {
        setFiles([]);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box component="span" sx={{ fontWeight: 600 }}>
                    Upload file
                </Box>
                <IconButton onClick={handleClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Add your files or documents here
                </Typography>

                {/* Drop zone */}
                <Box
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    sx={{
                        border: '2px dashed',
                        borderColor: isDragging ? 'primary.main' : 'divider',
                        borderRadius: 3,
                        p: 6,
                        textAlign: 'center',
                        bgcolor: isDragging ? 'primary.main' : 'background.default',
                        opacity: isDragging ? 0.1 : 1,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover',
                        },
                    }}
                    onClick={() => document.getElementById('file-input')?.click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        hidden
                        onChange={handleFileSelect}
                        {...(isFolder ? { webkitdirectory: '', directory: '' } : {})}
                    />
                    <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                        {isFolder
                            ? <>Drop your folder here, <Typography component="span" color="primary.main" sx={{ cursor: 'pointer' }}>or click to browse</Typography></>
                            : <>Drop your files here, <Typography component="span" color="primary.main" sx={{ cursor: 'pointer' }}>or click to browse</Typography></>
                        }
                    </Typography>
                </Box>

                {/* Selected files */}
                {files.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                            Selected files ({files.length})
                        </Typography>
                        {files.map((file, idx) => (
                            <Typography key={idx} variant="body2" color="text.secondary">
                                • {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </Typography>
                        ))}
                    </Box>
                )}

                {/* Continue button */}
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleContinue}
                    disabled={files.length === 0}
                    sx={{
                        mt: 3,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #7856FF 0%, #1DA1F2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5C3DC9 0%, #0C7ABF 100%)',
                        },
                        '&.Mui-disabled': {
                            background: 'action.disabledBackground',
                        },
                    }}
                >
                    Continue
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default UploadModal;
