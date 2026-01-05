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
}

interface FileRowProps {
  file: FileData;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (file: FileData) => void;
  onDownload?: (file: FileData) => void;
  onRename?: (file: FileData) => void;
  onDelete?: (file: FileData) => void;
  onShare?: (file: FileData) => void;
  onPreview?: (file: FileData) => void;
}

export const FileRow: React.FC<FileRowProps> = ({
  file,
  selected = false,
  onSelect,
  onClick,
  onDownload,
  onRename,
  onDelete,
  onShare,
  onPreview,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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
      onClick={() => onClick?.(file)}
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
          "&.Mui-checked": {
            color: selected ? "white" : "primary.main",
          },
        }}
      />

      {/* Icon */}
      <FileIcon type={file.type} extension={file.extension} />

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
        {onShare && file.type === "file" && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onShare);
            }}
          >
            <Share sx={{ mr: 1, fontSize: 18 }} /> Share
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
