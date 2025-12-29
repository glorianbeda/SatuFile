import React from 'react';
import { Box, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { FileIcon } from './FileIcon';

interface RecentFile {
    id: string;
    name: string;
    type: 'file' | 'folder';
    extension?: string;
    size?: string;
}

interface RecentFilesProps {
    files: RecentFile[];
    onViewAll?: () => void;
    onFileClick?: (file: RecentFile) => void;
}

export const RecentFiles: React.FC<RecentFilesProps> = ({
    files,
    onViewAll,
    onFileClick,
}) => {
    return (
        <Box sx={{ mb: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                    Recently modified
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer',
                        color: 'primary.main',
                        '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={onViewAll}
                >
                    <Typography variant="body2" fontWeight={500}>
                        View all
                    </Typography>
                    <ArrowForward sx={{ fontSize: 16 }} />
                </Box>
            </Box>

            {/* Cards - contained scroll */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    pb: 1,
                    mx: { xs: -2, sm: 0 }, // Negative margin to allow full-bleed scroll on mobile
                    px: { xs: 2, sm: 0 },
                    width: { xs: 'calc(100% + 32px)', sm: '100%' },
                    maxWidth: { xs: 'calc(100vw - 16px)', sm: '100%' },
                    '&::-webkit-scrollbar': {
                        height: 6,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: 'divider',
                        borderRadius: 3,
                    },
                }}
            >
                {files.map((file) => (
                    <Box
                        key={file.id}
                        sx={{
                            minWidth: { xs: 140, sm: 180, md: 200 },
                            maxWidth: { xs: 140, sm: 180, md: 200 },
                            flexShrink: 0,
                            p: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: 'primary.main',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            },
                        }}
                        onClick={() => onFileClick?.(file)}
                    >
                        <FileIcon type={file.type} extension={file.extension} size="large" />
                        <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{ mt: 1.5 }}
                            noWrap
                        >
                            {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {file.size} • {file.type === 'folder' ? 'Folder' : file.extension?.replace('.', '').toUpperCase()}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default RecentFiles;
