import React from 'react';
import { Box, Typography, Checkbox, IconButton } from '@mui/material';
import {
    Folder,
    InsertDriveFile,
    Image,
    VideoFile,
    AudioFile,
    PictureAsPdf,
    Article,
    MoreVert,
} from '@mui/icons-material';
import { filesApi } from '../../api';
import { ThumbnailImage } from './ThumbnailImage';

export interface FileItem {
    path: string;
    name: string;
    size: number;
    modified: string;
    isDir: boolean;
    type?: string;
    extension?: string;
}

interface FileGridProps {
    files: FileItem[];
    selectedFiles: string[];
    onToggleSelect: (path: string) => void;
    onFileClick: (file: FileItem) => void;
    onMenuClick?: (file: FileItem, anchorEl: HTMLElement) => void;
}

const getIcon = (file: FileItem) => {
    if (file.isDir) return <Folder sx={{ fontSize: 48, color: '#90CAF9' }} />;

    switch (file.type) {
        case 'image':
            return <Image sx={{ fontSize: 48, color: '#81C784' }} />;
        case 'video':
            return <VideoFile sx={{ fontSize: 48, color: '#FF8A65' }} />;
        case 'audio':
            return <AudioFile sx={{ fontSize: 48, color: '#BA68C8' }} />;
        case 'pdf':
            return <PictureAsPdf sx={{ fontSize: 48, color: '#E57373' }} />;
        case 'text':
            return <Article sx={{ fontSize: 48, color: '#64B5F6' }} />;
        default:
            return <InsertDriveFile sx={{ fontSize: 48, color: '#78909C' }} />;
    }
};

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
    onMenuClick,
}) => {
    return (
        <Box
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

                return (
                    <Box
                        key={file.path}
                        onClick={() => onFileClick(file)}
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
                                opacity: isSelected ? 1 : 0,
                                '&:hover': { opacity: 1 },
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
                            <ThumbnailImage
                                src={thumbnailUrl}
                                alt={file.name}
                                width={80}
                                height={80}
                            />
                        ) : (
                            getIcon(file)
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
