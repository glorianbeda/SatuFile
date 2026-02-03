import React from 'react';
import { Box, Typography, Checkbox, IconButton } from '@mui/material';
import {
    MoreVert,
    Share,
} from '@mui/icons-material';
import { filesApi } from '@/api';
import { ThumbnailImage } from './ThumbnailImage';
import { FileIcon } from './FileIcon';

export interface FileItem {
    path: string;
    name: string;
    size: number;
    modified: string;
    isDir: boolean;
    type?: string;
    extension?: string;
    isShared?: boolean;
}

interface FileGridProps {
    files: FileItem[];
    selectedFiles: string[];
    onToggleSelect: (path: string) => void;
    onFileClick: (file: FileItem, e: React.MouseEvent) => void;
    onFileDoubleClick?: (file: FileItem) => void;
    onFileLongPress?: (file: FileItem) => void;
    onMenuClick?: (file: FileItem, anchorEl: HTMLElement) => void;
    onContextMenu?: (e: React.MouseEvent) => void;
}

const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Check if file is an image for thumbnail
const isImageFile = (file: FileItem): boolean => {
    if (file.isDir) return false;
    const ext = file.extension?.toLowerCase() || file.name.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
};

export const FileGrid: React.FC<FileGridProps> = ({
    files,
    selectedFiles,
    onToggleSelect,
    onFileClick,
    onFileDoubleClick,
    onFileLongPress,
    onMenuClick,
    onContextMenu,
}) => {
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPress = React.useRef(false);

    const startPress = (file: FileItem) => {
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            onFileLongPress?.(file);
        }, 500);
    };

    const endPress = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    return (
        <Box
            onContextMenu={onContextMenu}
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                    lg: 'repeat(5, 1fr)',
                },
                gap: 2,
            }}
        >
            {files.map((file) => {
                const isSelected = selectedFiles.includes(file.path);
                const showThumbnail = isImageFile(file);
                const thumbnailUrl = showThumbnail ? filesApi.getDownloadUrl(file.path) : null;
                const anySelected = selectedFiles.length > 0;

                return (
                    <Box
                        key={file.path}
                        onMouseDown={() => startPress(file)}
                        onMouseUp={endPress}
                        onMouseLeave={endPress}
                        onTouchStart={() => startPress(file)}
                        onTouchEnd={endPress}
                        onClick={(e) => {
                            if (isLongPress.current) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                            }
                            onFileClick(file, e);
                        }}
                        onDoubleClick={(e) => {
                            if (isLongPress.current) return;
                            e.stopPropagation();
                            onFileDoubleClick?.(file);
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onMenuClick?.(file, e.currentTarget as HTMLElement);
                        }}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: isSelected ? 'action.selected' : 'background.paper',
                            border: '1px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                borderColor: 'primary.light',
                            },
                            '&:hover .menu-btn': {
                                opacity: 1,
                            },
                        }}
                    >
                        {/* Checkbox */}
                        <Checkbox
                            checked={isSelected}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSelect(file.path);
                            }}
                            size="small"
                            sx={{
                                position: 'absolute',
                                top: 4,
                                left: 4,
                                opacity: isSelected || anySelected ? 1 : 0,
                                '&:hover': { opacity: 1 },
                                zIndex: 2,
                                bgcolor: isSelected || anySelected ? 'background.paper' : 'transparent',
                                borderRadius: '50%',
                                p: 0.5,
                            }}
                        />

                        {/* Menu button */}
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMenuClick?.(file, e.currentTarget);
                            }}
                            sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                opacity: 0.6,
                                bgcolor: 'background.paper',
                                boxShadow: 1,
                                '&:hover': {
                                    opacity: 1,
                                    bgcolor: 'action.hover'
                                },
                            }}
                            className="menu-btn"
                        >
                            <MoreVert fontSize="small" />
                        </IconButton>

                        {/* Icon or Thumbnail */}
                        {showThumbnail && thumbnailUrl ? (
                            <Box sx={{ position: 'relative' }}>
                                <ThumbnailImage
                                    src={thumbnailUrl}
                                    alt={file.name}
                                    width={80}
                                    height={80}
                                />
                                {file.isShared && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: -2,
                                            left: -2,
                                            width: 20,
                                            height: 20,
                                            bgcolor: 'primary.main',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid',
                                            borderColor: 'background.paper',
                                            boxShadow: 1,
                                            zIndex: 1,
                                        }}
                                    >
                                        <Share sx={{ fontSize: '12px !important', color: 'white' }} />
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <FileIcon 
                                type={file.isDir ? 'folder' : 'file'} 
                                extension={file.extension} 
                                size="large" 
                                isShared={file.isShared} 
                            />
                        )}

                        {/* Name */}
                        <Typography
                            variant="body2"
                            sx={{
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                width: '100%',
                            }}
                        >
                            {file.name}
                        </Typography>

                        {/* Size (for files only) */}
                        {!file.isDir && (
                            <Typography variant="caption" color="text.secondary">
                                {formatSize(file.size)}
                            </Typography>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};

export default FileGrid;