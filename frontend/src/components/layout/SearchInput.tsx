import React, { useState, useEffect, useRef } from 'react';
import {
    InputBase,
    Paper,
    IconButton,
    Popper,
    Grow,
    ClickAwayListener,
    MenuList,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    CircularProgress
} from '@mui/material';
import { 
    Search, 
    Close, 
    Folder, 
    Image, 
    Movie, 
    AudioFile, 
    InsertDriveFile 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { filesApi, FileInfo } from '@/api/files';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputProps {
    fullWidth?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({ fullWidth }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const [results, setResults] = useState<FileInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const response = await filesApi.search(debouncedQuery);
                setResults(response.results);
                setOpen(true);
            } catch (error) {
                console.error("Search failed", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setOpen(false);
            anchorRef.current?.blur();
        }
    };

    const getIcon = (type?: string, isDir?: boolean) => {
        if (isDir) return <Folder color="primary" />;
        if (type === 'image') return <Image color="secondary" />;
        if (type === 'video') return <Movie color="error" />;
        if (type === 'audio') return <AudioFile color="warning" />;
        return <InsertDriveFile color="action" />;
    };

    const handleSelect = (path: string) => {
        if (path.startsWith("/")) {
             navigate(`/files${path}`);
        } else {
             navigate(`/files/${path}`);
        }
        setOpen(false);
    };

    return (
        <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
            <Paper
                ref={anchorRef}
                elevation={0}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    px: 2,
                    py: 0.5,
                    '&:focus-within': {
                        borderColor: 'primary.main',
                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                    },
                }}
            >
                <Search sx={{ color: 'text.secondary', mr: 1 }} />
                <InputBase
                    placeholder="Search files..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    fullWidth
                    endAdornment={
                        loading ? (
                            <CircularProgress size={20} />
                        ) : query ? (
                            <IconButton size="small" onClick={handleClear}>
                                <Close fontSize="small" />
                            </IconButton>
                        ) : null
                    }
                />
            </Paper>

            <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement="bottom-start"
                transition
                disablePortal
                style={{ width: anchorRef.current?.offsetWidth, zIndex: 1300 }}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom-start' ? 'left top' : 'left bottom',
                        }}
                    >
                        <Paper sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
                            <ClickAwayListener onClickAway={() => setOpen(false)}>
                                <MenuList>
                                    {results.length > 0 && (
                                        <MenuItem disabled divider>
                                            <Typography variant="caption" color="text.secondary">
                                                Found {results.length} results
                                            </Typography>
                                        </MenuItem>
                                    )}
                                    {results.length === 0 ? (
                                        <MenuItem disabled>
                                            <Typography variant="body2" color="text.secondary">
                                                No results found
                                            </Typography>
                                        </MenuItem>
                                    ) : (
                                        results.map((file) => (
                                            <MenuItem 
                                                key={file.path} 
                                                onClick={() => handleSelect(file.path)}
                                            >
                                                <ListItemIcon>
                                                    {getIcon(file.type, file.isDir)}
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={file.name} 
                                                    secondary={file.path}
                                                    secondaryTypographyProps={{ 
                                                        noWrap: true, 
                                                        fontSize: '0.75rem',
                                                        title: file.path 
                                                    }}
                                                />
                                            </MenuItem>
                                        ))
                                    )}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Box>
    );
};
