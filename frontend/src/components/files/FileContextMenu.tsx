import React from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Download,
  Edit,
  Delete,
  Visibility,
  FolderOpen,
  Share,
} from "@mui/icons-material";

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
  onShare?: (file: FileContextMenuItem) => void;
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
  onShare,
}) => {
  if (!file) return null;

  const handleAction = (
    e: React.MouseEvent,
    action?: (file: FileContextMenuItem) => void,
  ) => {
    e.stopPropagation();
    onClose();
    if (action && file) {
      action(file);
    }
  };

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const isPreviewable =
    !file.isDir &&
    (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext) ||
      ["mp4", "webm", "avi", "mov", "mkv"].includes(ext) ||
      ["mp3", "wav", "ogg", "m4a", "flac"].includes(ext) ||
      ext === "pdf");

  // Build menu items as array to avoid Fragment issue with MUI Menu
  const menuItems: React.ReactNode[] = [];

  if (file.isDir) {
    menuItems.push(
      <MenuItem key="open" onClick={(e) => handleAction(e, onOpen)}>
        <ListItemIcon>
          <FolderOpen fontSize="small" />
        </ListItemIcon>
        <ListItemText>Buka</ListItemText>
      </MenuItem>,
    );
  } else {
    if (isPreviewable) {
      menuItems.push(
        <MenuItem key="preview" onClick={(e) => handleAction(e, onPreview)}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Preview</ListItemText>
        </MenuItem>,
      );
    }
    menuItems.push(
      <MenuItem key="download" onClick={(e) => handleAction(e, onDownload)}>
        <ListItemIcon>
          <Download fontSize="small" />
        </ListItemIcon>
        <ListItemText>Download</ListItemText>
      </MenuItem>,
    );
  }

  if (onShare && !file.isDir) {
    menuItems.push(
      <MenuItem key="share" onClick={(e) => handleAction(e, onShare)}>
        <ListItemIcon>
          <Share fontSize="small" />
        </ListItemIcon>
        <ListItemText>Share</ListItemText>
      </MenuItem>,
    );
  }

  if (onRename) {
    menuItems.push(
      <MenuItem key="rename" onClick={(e) => handleAction(e, onRename)}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Rename</ListItemText>
      </MenuItem>,
    );
  }

  menuItems.push(
    <MenuItem
      key="delete"
      onClick={(e) => handleAction(e, onDelete)}
      sx={{ color: "error.main" }}
    >
      <ListItemIcon>
        <Delete fontSize="small" color="error" />
      </ListItemIcon>
      <ListItemText>Delete</ListItemText>
    </MenuItem>,
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {menuItems}
    </Menu>
  );
};

export default FileContextMenu;
