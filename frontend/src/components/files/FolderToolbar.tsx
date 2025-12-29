import React from 'react';
import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Tooltip,
    Divider,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    ViewList,
    ViewModule,
    SortByAlpha,
    ArrowDropDown,
    AccessTime,
    Storage,
    ArrowUpward,
    ArrowDownward,
    ArrowBack,
} from '@mui/icons-material';

export type ViewMode = 'list' | 'grid';
export type SortOption = 'name' | 'modified' | 'size';
export type SortOrder = 'asc' | 'desc';

interface FolderToolbarProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    sortBy: SortOption;
    sortOrder: SortOrder;
    onSortChange: (by: SortOption, order: SortOrder) => void;
    numDirs?: number;
    numFiles?: number;
    isAtRoot?: boolean;
    onBack?: () => void;
}

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'name', label: 'Nama', icon: <SortByAlpha fontSize="small" /> },
    { value: 'modified', label: 'Tanggal', icon: <AccessTime fontSize="small" /> },
    { value: 'size', label: 'Ukuran', icon: <Storage fontSize="small" /> },
];

export const FolderToolbar: React.FC<FolderToolbarProps> = ({
    viewMode,
    onViewModeChange,
    sortBy,
    sortOrder,
    onSortChange,
    numDirs,
    numFiles,
    isAtRoot = true,
    onBack,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const currentSort = sortOptions.find((s) => s.value === sortBy) || sortOptions[0];

    const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setAnchorEl(null);
    };

    const handleSortSelect = (option: SortOption) => {
        if (option === sortBy) {
            // Toggle order if same option
            onSortChange(option, sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            onSortChange(option, 'asc');
        }
        handleSortClose();
    };

    const toggleOrder = () => {
        onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                py: 1,
                px: 0,
                mb: 2,
            }}
        >
            {/* Left: Back button + File count */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Back button */}
                <Tooltip title={isAtRoot ? '' : 'Kembali'}>
                    <span>
                        <IconButton
                            size="small"
                            onClick={onBack}
                            disabled={isAtRoot}
                            sx={{ mr: 1 }}
                        >
                            <ArrowBack />
                        </IconButton>
                    </span>
                </Tooltip>

                <Typography variant="body2" color="text.secondary">
                    {numDirs !== undefined && numFiles !== undefined && (
                        <>
                            {numDirs > 0 && `${numDirs} folder`}
                            {numDirs > 0 && numFiles > 0 && ', '}
                            {numFiles > 0 && `${numFiles} file`}
                        </>
                    )}
                </Typography>
            </Box>

            {/* Right: Sort + View toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Sort button */}
                <Tooltip title="Urutkan">
                    <Box
                        onClick={handleSortClick}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: 'pointer',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                    >
                        {currentSort.icon}
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {currentSort.label}
                        </Typography>
                        <ArrowDropDown fontSize="small" />
                    </Box>
                </Tooltip>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleSortClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    {sortOptions.map((option) => (
                        <MenuItem
                            key={option.value}
                            onClick={() => handleSortSelect(option.value)}
                            selected={option.value === sortBy}
                        >
                            <ListItemIcon>{option.icon}</ListItemIcon>
                            <ListItemText>{option.label}</ListItemText>
                            {option.value === sortBy && (
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleOrder(); }}>
                                    {sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                                </IconButton>
                            )}
                        </MenuItem>
                    ))}
                </Menu>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* View mode toggle */}
                <Tooltip title="Tampilan List">
                    <IconButton
                        size="small"
                        onClick={() => onViewModeChange('list')}
                        color={viewMode === 'list' ? 'primary' : 'default'}
                    >
                        <ViewList />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Tampilan Grid">
                    <IconButton
                        size="small"
                        onClick={() => onViewModeChange('grid')}
                        color={viewMode === 'grid' ? 'primary' : 'default'}
                    >
                        <ViewModule />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default FolderToolbar;
