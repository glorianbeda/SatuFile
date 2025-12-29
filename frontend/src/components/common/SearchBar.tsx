import React, { useState } from 'react';
import {
    InputBase,
    Paper,
    IconButton,
    InputAdornment,
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
    fullWidth?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search files...',
    onSearch,
    fullWidth = false,
}) => {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (onSearch) {
            onSearch(query);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClear = () => {
        setQuery('');
        if (onSearch) {
            onSearch('');
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                display: 'flex',
                alignItems: 'center',
                width: fullWidth ? '100%' : { xs: '100%', sm: 300, md: 400 },
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                px: 2,
                py: 0.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: 'primary.main',
                },
                '&:focus-within': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 3px rgba(29, 161, 242, 0.1)',
                },
            }}
        >
            <Search sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{ flex: 1, fontSize: '0.95rem' }}
                endAdornment={
                    query && (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={handleClear}>
                                <Close fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    )
                }
            />
        </Paper>
    );
};

export default SearchBar;
