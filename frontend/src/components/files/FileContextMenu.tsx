import React from 'react';
import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Download,
    Edit,
    Delete,
    Visibility,
    FolderOpen,
} from '@mui/icons-material';

export interface FileContextMenuItem {
    path: string;
    name: string;
    isDir: boolean;
    type?: string;
}

interface FileContextMenuProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    file: FileContextMenuItem | null;
    onOpen?: (file: FileContextMenuItem) => void;
    onDownload?: (file: FileContextMenuItem) => void;
    onRename?: (file: FileContextMenuItem) => void;
    onDelete?: (file: FileContextMenuItem) => void;
    onPreview?: (file: FileContextMenuItem) => void;
}

export const FileContextMenu: React.FC<FileContextMenuProps> = ({
    anchorEl,
    open,
    onClose,
    file,
    onOpen,
    onDownload,
    onRename,
    onDelete,
    onPreview,
}) => {
    if (!file) return null;

    const handleAction = (action?: (file: FileContextMenuItem) => void) => {
        onClose();
        if (action && file) {
            action(file);
        }
    };

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isPreviewable = !file.isDir && (
        ['image', 'video', 'audio'].includes(file.type || '') ||
        ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mp3', 'wav'].includes(ext)
    );

    // Build menu items as array to avoid Fragment issue with MUI Menu
    const menuItems: React.ReactNode[] = [];

    if (file.isDir) {
        menuItems.push(
            <MenuItem key="open" onClick={() => handleAction(onOpen)}>
                <ListItemIcon>
                    <FolderOpen fontSize="small" />
                </ListItemIcon>
                <ListItemText>Buka</ListItemText>
            </MenuItem>
        );
    } else {
        if (isPreviewable) {
            menuItems.push(
                <MenuItem key="preview" onClick={() => handleAction(onPreview)}>
                    <ListItemIcon>
                        <Visibility fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Preview</ListItemText>
                </MenuItem>
            );
        }
        menuItems.push(
            <MenuItem key="download" onClick={() => handleAction(onDownload)}>
                <ListItemIcon>
                    <Download fontSize="small" />
                </ListItemIcon>
                <ListItemText>Download</ListItemText>
            </MenuItem>
        );
    }

    menuItems.push(<Divider key="divider" />);

    menuItems.push(
        <MenuItem key="rename" onClick={() => handleAction(onRename)}>
            <ListItemIcon>
                <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Rename</ListItemText>
        </MenuItem>
    );

    menuItems.push(
        <MenuItem key="delete" onClick={() => handleAction(onDelete)} sx={{ color: 'error.main' }}>
            <ListItemIcon>
                <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
        </MenuItem>
    );

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            {menuItems}
        </Menu>
    );
};

export default FileContextMenu;
