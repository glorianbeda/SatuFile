import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    LinearProgress,
    IconButton,
    Collapse,
    Fade,
    useTheme,
} from '@mui/material';
import {
    Close,
    ExpandLess,
    ExpandMore,
    CheckCircle,
    Error,
    CloudUpload,
    InsertDriveFile,
    Speed,
    Schedule,
    Pause,
    PlayArrow,
} from '@mui/icons-material';

export type UploadStatus = 'pending' | 'uploading' | 'paused' | 'completed' | 'error';

export interface UploadItem {
    id: string;
    file: File;
    progress: number;
    status: UploadStatus;
    error?: string;
    loaded?: number;        // Bytes uploaded
    startTime?: number;     // Upload start timestamp
    speed?: number;         // Bytes per second
    eta?: number;           // Estimated time remaining in seconds
}

interface UploadProgressProps {
    uploads: UploadItem[];
    onClose: () => void;
    onCancel?: (id: string) => void;
    onPause?: (id: string) => void;
    onResume?: (id: string) => void;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatETA = (seconds: number): string => {
    if (!seconds || seconds === Infinity) return '...';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
        case 'completed':
            return <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />;
        case 'error':
            return <Error sx={{ color: 'error.main', fontSize: 20 }} />;
        default:
            return <InsertDriveFile sx={{ color: 'text.secondary', fontSize: 20 }} />;
    }
};

export const UploadProgress: React.FC<UploadProgressProps> = ({
    uploads,
    onClose,
    onPause,
    onResume,
}) => {
    const [expanded, setExpanded] = useState(true);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    if (uploads.length === 0) return null;

    const completedCount = uploads.filter((u) => u.status === 'completed').length;
    const errorCount = uploads.filter((u) => u.status === 'error').length;
    const uploadingCount = uploads.filter((u) => u.status === 'uploading').length;
    const totalProgress = uploads.reduce((acc, u) => acc + u.progress, 0) / uploads.length;

    // Calculate total loaded and total size
    const totalLoaded = uploads.reduce((acc, u) => acc + (u.loaded || 0), 0);
    const totalSize = uploads.reduce((acc, u) => acc + u.file.size, 0);
    const avgSpeed = uploads
        .filter((u) => u.status === 'uploading' && u.speed)
        .reduce((acc, u) => acc + (u.speed || 0), 0) / Math.max(uploadingCount, 1);

    const isAllComplete = completedCount + errorCount === uploads.length;
    const hasErrors = errorCount > 0;

    return (
        <Fade in>
            <Paper
                elevation={8}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    width: 400,
                    maxWidth: 'calc(100vw - 48px)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    zIndex: 1400,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: isDark
                        ? '0 8px 32px rgba(0,0,0,0.4)'
                        : '0 8px 32px rgba(0,0,0,0.15)',
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1.5,
                        background: isDark
                            ? 'linear-gradient(90deg, rgba(120, 86, 255, 0.15) 0%, rgba(29, 161, 242, 0.15) 100%)'
                            : 'linear-gradient(90deg, rgba(120, 86, 255, 0.08) 0%, rgba(29, 161, 242, 0.08) 100%)',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #7856FF 0%, #1DA1F2 100%)',
                            }}
                        >
                            <CloudUpload sx={{ color: 'white', fontSize: 22 }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                {isAllComplete
                                    ? hasErrors
                                        ? 'Upload selesai dengan error'
                                        : '✓ Upload selesai!'
                                    : `Mengupload ${uploadingCount} file...`}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    {formatFileSize(totalLoaded)} / {formatFileSize(totalSize)}
                                </Typography>
                                {!isAllComplete && avgSpeed > 0 && (
                                    <>
                                        <Typography variant="caption" color="text.disabled">•</Typography>
                                        <Typography variant="caption" color="primary.main" fontWeight={500}>
                                            {formatSpeed(avgSpeed)}
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                            {expanded ? <ExpandMore /> : <ExpandLess />}
                        </IconButton>
                        {isAllComplete && (
                            <IconButton size="small" onClick={onClose}>
                                <Close />
                            </IconButton>
                        )}
                    </Box>
                </Box>

                {/* Overall progress bar */}
                {!isAllComplete && (
                    <LinearProgress
                        variant="determinate"
                        value={totalProgress}
                        sx={{
                            height: 4,
                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #7856FF 0%, #1DA1F2 100%)',
                            },
                        }}
                    />
                )}

                {/* File list */}
                <Collapse in={expanded}>
                    <Box sx={{ maxHeight: 300, overflow: 'auto', p: 1.5 }}>
                        {uploads.map((upload) => (
                            <Box
                                key={upload.id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    p: 1.5,
                                    mb: 1,
                                    borderRadius: 2,
                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                    border: '1px solid',
                                    borderColor: upload.status === 'error'
                                        ? 'error.main'
                                        : upload.status === 'completed'
                                            ? 'success.main'
                                            : 'divider',
                                    transition: 'all 0.2s',
                                    '&:last-child': { mb: 0 },
                                }}
                            >
                                {/* Icon */}
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                    }}
                                >
                                    {getStatusIcon(upload.status)}
                                </Box>

                                {/* File info */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        noWrap
                                        fontWeight={500}
                                        color="text.primary"
                                        sx={{ mb: 0.3 }}
                                    >
                                        {upload.file.name}
                                    </Typography>

                                    {upload.status === 'uploading' ? (
                                        <>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={upload.progress}
                                                    sx={{
                                                        flex: 1,
                                                        height: 6,
                                                        borderRadius: 3,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                                        '& .MuiLinearProgress-bar': {
                                                            borderRadius: 3,
                                                            background: 'linear-gradient(90deg, #7856FF 0%, #1DA1F2 100%)',
                                                        },
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    color="primary.main"
                                                    fontWeight={600}
                                                    sx={{ minWidth: 40, textAlign: 'right' }}
                                                >
                                                    {Math.round(upload.progress)}%
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatFileSize(upload.loaded || 0)} / {formatFileSize(upload.file.size)}
                                                </Typography>
                                                {upload.speed && upload.speed > 0 && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                                        <Speed sx={{ fontSize: 12, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatSpeed(upload.speed)}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {upload.eta && upload.eta > 0 && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                                        <Schedule sx={{ fontSize: 12, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            ~{formatETA(upload.eta)}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </>
                                    ) : upload.status === 'error' ? (
                                        <Typography variant="caption" color="error.main">
                                            {upload.error || 'Upload gagal'}
                                        </Typography>
                                    ) : upload.status === 'completed' ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="caption" color="success.main" fontWeight={500}>
                                                ✓ Selesai
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                {formatFileSize(upload.file.size)}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">
                                            {formatFileSize(upload.file.size)} • Menunggu...
                                        </Typography>
                                    )}
                                </Box>

                                {/* Pause/Resume buttons */}
                                {upload.status === 'uploading' && onPause && (
                                    <IconButton
                                        size="small"
                                        onClick={() => onPause(upload.id)}
                                        title="Pause"
                                        sx={{ ml: 1 }}
                                    >
                                        <Pause fontSize="small" />
                                    </IconButton>
                                )}
                                {upload.status === 'paused' && onResume && (
                                    <IconButton
                                        size="small"
                                        onClick={() => onResume(upload.id)}
                                        title="Resume"
                                        color="primary"
                                        sx={{ ml: 1 }}
                                    >
                                        <PlayArrow fontSize="small" />
                                    </IconButton>
                                )}
                                {upload.status === 'error' && onResume && (
                                    <IconButton
                                        size="small"
                                        onClick={() => onResume(upload.id)}
                                        title="Coba Lagi"
                                        color="error"
                                        sx={{ ml: 1 }}
                                    >
                                        <PlayArrow fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Collapse>

                {/* Footer with summary */}
                {isAllComplete && (
                    <Box
                        sx={{
                            px: 2,
                            py: 1.5,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            bgcolor: hasErrors
                                ? isDark ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)'
                                : isDark ? 'rgba(46, 125, 50, 0.1)' : 'rgba(46, 125, 50, 0.05)',
                        }}
                    >
                        {hasErrors ? (
                            <Typography variant="caption" color="error.main" fontWeight={500}>
                                ⚠️ {errorCount} file gagal diupload
                            </Typography>
                        ) : (
                            <Typography variant="caption" color="success.main" fontWeight={500}>
                                ✓ {completedCount} file berhasil diupload ({formatFileSize(totalSize)})
                            </Typography>
                        )}
                    </Box>
                )}
            </Paper>
        </Fade>
    );
};

export default UploadProgress;
