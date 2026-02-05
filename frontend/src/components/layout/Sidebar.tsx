import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Toolbar } from '@mui/material';
import {
  Folder as FolderIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  Movie as VideoIcon,
  AudioFile as AudioIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchInput } from './SearchInput';
import { StorageIndicator } from './StorageIndicator';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { text: 'Files', icon: <FolderIcon />, path: '/' },
    { text: 'Documents', icon: <DocumentIcon />, path: '/files/Documents' },
    { text: 'Pictures', icon: <ImageIcon />, path: '/files/Pictures' },
    { text: 'Videos', icon: <VideoIcon />, path: '/files/Videos' },
    { text: 'Audio', icon: <AudioIcon />, path: '/files/Audio' },
    { text: 'Downloads', icon: <DownloadIcon />, path: '/files/Downloads' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar /> {/* Spacer for header */}
      
      {/* Search Component */}
      <Box sx={{ p: 2 }}>
        <SearchInput fullWidth />
      </Box>

      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton
             selected={location.pathname === '/trash'}
             onClick={() => handleNavigate('/trash')}
          >
            <ListItemIcon><DeleteIcon /></ListItemIcon>
            <ListItemText primary="Trash" />
          </ListItemButton>
        </ListItem>
      </List>
      
      {/* Storage Indicator */}
      <Box sx={{ p: 2 }}>
        <StorageIndicator />
      </Box>
    </Box>
  );
};
