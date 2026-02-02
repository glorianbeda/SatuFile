import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { CreateNewFolder, UploadFile, Refresh } from '@mui/icons-material';

interface BackgroundContextMenuProps {
    open: boolean;
    onClose: () => void;
    anchorPosition: { top: number; left: number } | null;
    onNewFolder: () => void;
    onUpload: () => void;
    onRefresh: () => void;
}

export const BackgroundContextMenu: React.FC<BackgroundContextMenuProps> = ({
    open,
    onClose,
    anchorPosition,
    onNewFolder,
    onUpload,
    onRefresh,
}) => {
    return (
        <Menu
            open={open}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition || undefined}
            onContextMenu={(e) => e.preventDefault()}
            slotProps={{
                backdrop: {
                    onContextMenu: (e) => {
                        e.preventDefault();
                        // This prevents browser menu when clicking backdrop
                    }
                }
            }}
        >
            <MenuItem onClick={() => { onClose(); onNewFolder(); }}>
                <ListItemIcon><CreateNewFolder fontSize="small" /></ListItemIcon>
                <ListItemText>New Folder</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { onClose(); onUpload(); }}>
                <ListItemIcon><UploadFile fontSize="small" /></ListItemIcon>
                <ListItemText>Upload File</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { onClose(); onRefresh(); }}>
                <ListItemIcon><Refresh fontSize="small" /></ListItemIcon>
                <ListItemText>Refresh</ListItemText>
            </MenuItem>
        </Menu>
    );
};
