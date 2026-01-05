import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Box,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Typography,
    Button,
    Tooltip,
    useMediaQuery,
    useTheme as useMuiTheme,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    CloudUpload,
    Add,
    Notifications,
    DarkMode,
    LightMode,
    Search,
    Settings,
    Person,
    CreateNewFolder,
    FolderOpen,
    Share,
} from '@mui/icons-material';
import { SearchBar } from '../common/SearchBar';
import { useTheme } from '../../contexts/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
    onUploadClick?: () => void;
    onFolderUploadClick?: () => void;
    onNewFolderClick?: () => void;
    onSharesClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUploadClick, onFolderUploadClick, onNewFolderClick, onSharesClick }) => {
    const navigate = useNavigate();
    const muiTheme = useMuiTheme();
    const { mode, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [createAnchorEl, setCreateAnchorEl] = React.useState<null | HTMLElement>(null);
    const [searchOpen, setSearchOpen] = React.useState(false);

    // Responsive breakpoints
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm')); // <600px
    const isTablet = useMediaQuery(muiTheme.breakpoints.down('md')); // <900px

    const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    // Create menu handlers
    const handleCreateClick = (event: React.MouseEvent<HTMLElement>) => {
        setCreateAnchorEl(event.currentTarget);
    };

    const handleCreateClose = () => {
        setCreateAnchorEl(null);
    };

    const handleUpload = () => {
        handleCreateClose();
        onUploadClick?.();
    };

    const handleNewFolder = () => {
        handleCreateClose();
        onNewFolderClick?.();
    };

    const handleFolderUpload = () => {
        handleCreateClose();
        onFolderUploadClick?.();
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                width: '100%',
            }}
        >
            <Toolbar
                sx={{
                    width: '100%',
                    maxWidth: '100%',
                    gap: { xs: 1, sm: 2 },
                    py: 1,
                    px: { xs: 2, sm: 3 },
                    minHeight: { xs: 56, sm: 64 },
                }}
            >
                {/* Logo */}
                <Box
                    component="img"
                    src="/logo-long.svg"
                    alt="SatuFile"
                    sx={{
                        height: { xs: 28, sm: 32 },
                        width: 'auto',
                        display: { xs: 'none', sm: 'block' },
                        mr: 2,
                    }}
                />
                {/* Search - always show but adjust width */}
                <Box sx={{
                    flex: { xs: searchOpen ? 1 : 0, sm: 1 },
                    display: 'flex',
                    alignItems: 'center',
                    maxWidth: { sm: 300, md: 400, lg: 500 },
                    minWidth: { sm: 200 },
                }}>
                    {isMobile && !searchOpen ? (
                        <IconButton
                            onClick={() => setSearchOpen(true)}
                            sx={{ color: 'text.secondary' }}
                        >
                            <Search />
                        </IconButton>
                    ) : (
                        <SearchBar fullWidth />
                    )}
                </Box>

                {/* Close search on mobile */}
                {isMobile && searchOpen && (
                    <IconButton onClick={() => setSearchOpen(false)} size="small">
                        <Typography variant="caption">Cancel</Typography>
                    </IconButton>
                )}

                {/* Spacer */}
                {(!isMobile || !searchOpen) && <Box sx={{ flex: 1 }} />}

                {/* Actions - hide when mobile search is open */}
                {(!isMobile || !searchOpen) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
                        {/* Create Button with Dropdown */}
                        {isMobile ? (
                            <IconButton
                                onClick={handleCreateClick}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                }}
                            >
                                <Add />
                            </IconButton>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleCreateClick}
                                size={isTablet ? 'small' : 'medium'}
                                sx={{
                                    background: 'linear-gradient(135deg, #1DA1F2 0%, #7856FF 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #0C7ABF 0%, #5C3DC9 100%)',
                                    },
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Create
                            </Button>
                        )}

                        {/* Create Dropdown Menu */}
                        <Menu
                            anchorEl={createAnchorEl}
                            open={Boolean(createAnchorEl)}
                            onClose={handleCreateClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem onClick={handleUpload}>
                                <ListItemIcon>
                                    <CloudUpload fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Upload File</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={handleFolderUpload}>
                                <ListItemIcon>
                                    <FolderOpen fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Upload Folder</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={handleNewFolder}>
                                <ListItemIcon>
                                    <CreateNewFolder fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>New Folder</ListItemText>
                            </MenuItem>
                        </Menu>

                        {/* Shares - Hide on mobile */}
                        {!isMobile && (
                            <Tooltip title="Kelola Share">
                                <IconButton
                                    onClick={onSharesClick}
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <Share />
                                </IconButton>
                            </Tooltip>
                        )}

                        {/* Notifications - Hide on mobile */}
                        {!isMobile && (
                            <Tooltip title="Notifications">
                                <IconButton sx={{ color: 'text.secondary' }}>
                                    <Notifications />
                                </IconButton>
                            </Tooltip>
                        )}

                        {/* Theme Toggle */}
                        <Tooltip title={`${mode === 'light' ? 'Dark' : 'Light'} mode`}>
                            <IconButton onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
                                {mode === 'light' ? <DarkMode /> : <LightMode />}
                            </IconButton>
                        </Tooltip>

                        {/* Profile */}
                        <IconButton onClick={handleProfileClick}>
                            <Avatar
                                sx={{
                                    width: { xs: 32, sm: 36 },
                                    height: { xs: 32, sm: 36 },
                                    bgcolor: 'primary.main',
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                }}
                            >
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            PaperProps={{ sx: { mt: 1, minWidth: 180 } }}
                        >
                            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle2">{user?.username}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user?.perm?.admin ? 'Administrator' : 'User'}
                                </Typography>
                            </Box>
                            {isMobile && (
                                <>
                                    <MenuItem onClick={handleClose}>
                                        <Notifications sx={{ mr: 1, fontSize: 20 }} /> Notifications
                                    </MenuItem>
                                    <MenuItem onClick={() => { handleClose(); onSharesClick?.(); }}>
                                        <Share sx={{ mr: 1, fontSize: 20 }} /> Kelola Share
                                    </MenuItem>
                                    <MenuItem onClick={handleClose}>
                                        <Add sx={{ mr: 1, fontSize: 20 }} /> Create New
                                    </MenuItem>
                                </>
                            )}
                            <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
                                <Person sx={{ mr: 1, fontSize: 20 }} /> Profile
                            </MenuItem>
                            <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
                                <Settings sx={{ mr: 1, fontSize: 20 }} /> Settings
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
