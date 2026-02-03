import React, { useState } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Folder as FolderIcon,
    Settings as SettingsIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '@/contexts/ThemeProvider';

const DRAWER_WIDTH = 240;

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const { mode, toggleTheme } = useAppTheme();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: 'Files', icon: <FolderIcon /> },
        { text: 'Settings', icon: <SettingsIcon /> },
    ];

    const drawer = (
        <Box>
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                    SatuFile
                </Typography>
            </Toolbar>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Dashboard
                    </Typography>
                    <IconButton color="inherit" onClick={toggleTheme}>
                        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={isMobile ? mobileOpen : true}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    mt: '64px',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
