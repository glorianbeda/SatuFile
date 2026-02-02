import React from "react";
import {
  Box,
  Typography,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  MoreVert,
  Download,
  Edit,
  Delete,
  Share,
  Visibility,
  VisibilityOff,
  FolderShared,
} from "@mui/icons-material";
import { FileIcon } from "./FileIcon";

export interface FileData {
  id: string;
  name: string;
  type: "file" | "folder";
  extension?: string;
  size?: string;
  owner?: string;
  modifiedAt?: string;
  isShared?: boolean;
}

interface FileRowProps {
  file: FileData;
  selected?: boolean;
  anySelected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (file: FileData, e: React.MouseEvent) => void;
  onDoubleClick?: (file: FileData) => void;
  onLongPress?: (file: FileData) => void;
  onDownload?: (file: FileData) => void;
  onRename?: (file: FileData) => void;
  onDelete?: (file: FileData) => void;
  onShare?: (file: FileData) => void;
  onPreview?: (file: FileData) => void;
  onHide?: (file: FileData) => void;
}

export const FileRow: React.FC<FileRowProps> = ({
  file,
  selected = false,
  anySelected = false,
  onSelect,
  onClick,
  onDoubleClick,
  onLongPress,
  onDownload,
  onRename,
  onDelete,
  onShare,
  onPreview,
  onHide,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isLongPress = React.useRef(false);

  const startPress = React.useCallback(() => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress?.(file);
    }, 500);
  }, [file, onLongPress]);

  const endPress = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action?: (file: FileData) => void) => {
    handleMenuClose();
    if (action) {
      action(file);
    }
  };

  // Determine if file is previewable
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const isPreviewable =
    file.type === "file" &&
    (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext) ||
      ["mp4", "webm", "avi", "mov", "mkv"].includes(ext) ||
      ["mp3", "wav", "ogg", "m4a", "flac"].includes(ext) ||
      ext === "pdf");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        cursor: "pointer",
        transition: "all 0.15s ease",
        "&:hover": {
          bgcolor: "action.hover",
        },
        ...(selected && {
          bgcolor: "primary.main",
          color: "white",
          "&:hover": {
            bgcolor: "primary.dark",
          },
        }),
      }}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onClick={(e) => {
        if (isLongPress.current) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onClick?.(file, e);
      }}
      onDoubleClick={(e) => {
        if (isLongPress.current) return;
        e.stopPropagation();
        onDoubleClick?.(file);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorEl(e.currentTarget as HTMLElement);
      }}
    >
      {/* Checkbox */}
      <Checkbox
        size="small"
        checked={selected}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onSelect?.(file.id)}
        sx={{
          color: selected ? "white" : "text.secondary",
          opacity: selected || anySelected ? 1 : { xs: 1, sm: 0 },
          transition: "opacity 0.2s",
          "&:hover": { opacity: 1 },
          "&.Mui-checked": {
            color: selected ? "white" : "primary.main",
          },
        }}
      />

      {/* Icon */}
      <FileIcon type={file.type} extension={file.extension} isShared={file.isShared} />

      {/* Name */}
      <Typography
        variant="body2"
        fontWeight={500}
        sx={{ flex: 1, minWidth: 0 }}
        noWrap
      >
        {file.name}
      </Typography>

      {/* Owner */}
      <Typography
        variant="body2"
        color={selected ? "inherit" : "text.secondary"}
        sx={{ width: 140, display: { xs: "none", md: "block" } }}
        noWrap
      >
        {file.owner || "-"}
      </Typography>

      {/* Size */}
      <Typography
        variant="body2"
        color={selected ? "inherit" : "text.secondary"}
        sx={{
          width: 80,
          textAlign: "right",
          display: { xs: "none", sm: "block" },
        }}
      >
        {file.size || "-"}
      </Typography>

      {/* Date */}
      <Typography
        variant="body2"
        color={selected ? "inherit" : "text.secondary"}
        sx={{ width: 100, textAlign: "right" }}
      >
        {file.modifiedAt || "-"}
      </Typography>

      {/* Actions */}
      <IconButton
        size="small"
        onClick={handleMenuClick}
        sx={{ color: selected ? "white" : "text.secondary" }}
      >
        <MoreVert fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        onContextMenu={(e) => e.preventDefault()}
        slotProps={{
          backdrop: {
            onContextMenu: (e) => {
              e.preventDefault();
            }
          }
        }}
      >
        {file.type === "folder" ? (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(file);
            }}
          >
            <Download sx={{ mr: 1, fontSize: 18 }} /> Open Folder
          </MenuItem>
        ) : [
          isPreviewable && onPreview && (
            <MenuItem
              key="preview"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onPreview);
              }}
            >
              <Visibility sx={{ mr: 1, fontSize: 18 }} /> Preview
            </MenuItem>
          ),
          onDownload && (
            <MenuItem
              key="download"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onDownload);
              }}
            >
              <Download sx={{ mr: 1, fontSize: 18 }} /> Download
            </MenuItem>
          ),
        ]}
        {onShare && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onShare);
            }}
          >
            <Share sx={{ mr: 1, fontSize: 18 }} /> Share
          </MenuItem>
        )}
        {onHide && !file.name.startsWith(".") && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onHide);
            }}
          >
            <VisibilityOff sx={{ mr: 1, fontSize: 18 }} /> Sembunyikan
          </MenuItem>
        )}
        {onRename && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onRename);
            }}
          >
            <Edit sx={{ mr: 1, fontSize: 18 }} /> Rename
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onDelete);
            }}
            sx={{ color: "error.main" }}
          >
            <Delete sx={{ mr: 1, fontSize: 18 }} /> Delete
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default FileRow;
