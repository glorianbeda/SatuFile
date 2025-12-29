import React from 'react';
import { Box, Typography, Checkbox } from '@mui/material';
import { FileRow } from './FileRow';
import type { FileData } from './FileRow';

interface FileListProps {
    files: FileData[];
    selectedIds?: string[];
    onSelect?: (id: string) => void;
    onSelectAll?: () => void;
    onFileClick?: (file: FileData) => void;
}

export const FileList: React.FC<FileListProps> = ({
    files,
    selectedIds = [],
    onSelect,
    onSelectAll,
    onFileClick,
}) => {
    const allSelected = files.length > 0 && selectedIds.length === files.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < files.length;

    return (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, overflow: 'hidden' }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                }}
            >
                <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={onSelectAll}
                />
                <Box sx={{ width: 40 }} /> {/* Icon spacer */}
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                    Name
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ width: 140, display: { xs: 'none', md: 'block' } }}>
                    Owner
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ width: 80, textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                    Size
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ width: 100, textAlign: 'right' }}>
                    Modified
                </Typography>
                <Box sx={{ width: 40 }} /> {/* Actions spacer */}
            </Box>

            {/* File rows */}
            <Box sx={{ py: 1 }}>
                {files.map((file) => (
                    <FileRow
                        key={file.id}
                        file={file}
                        selected={selectedIds.includes(file.id)}
                        onSelect={onSelect}
                        onClick={onFileClick}
                    />
                ))}
            </Box>

            {/* Empty state */}
            {files.length === 0 && (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No files found
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default FileList;
