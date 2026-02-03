import React from "react";
import { Box, Typography, Checkbox } from "@mui/material";
import { FileRow } from "./FileRow";
import type { FileData } from "./FileRow";

interface FileListProps {
  files: FileData[];
  selectedIds?: string[];
  isMultiSelectMode?: boolean;
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onFileClick?: (file: FileData, e: React.MouseEvent) => void;
  onFileDoubleClick?: (file: FileData) => void;
  onFileLongPress?: (file: FileData) => void;
  onDownload?: (file: FileData) => void;
  onRename?: (file: FileData) => void;
  onDelete?: (file: FileData) => void;
  onShare?: (file: FileData) => void;
  onPreview?: (file: FileData) => void;
  onHide?: (file: FileData) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedIds = [],
  isMultiSelectMode = false,
  onSelect,
  onSelectAll,
  onFileClick,
  onFileDoubleClick,
  onFileLongPress,
  onDownload,
  onRename,
  onDelete,
  onShare,
  onPreview,
  onHide,
  onContextMenu,
}) => {
  const allSelected = files.length > 0 && selectedIds.length === files.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < files.length;
  const anySelected = selectedIds.length > 0;

  return (
    <Box
      sx={{ bgcolor: "background.paper", borderRadius: 3, overflow: "hidden" }}
      onContextMenu={onContextMenu}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
        }}
      >
        <Checkbox
          size="small"
          checked={allSelected}
          indeterminate={someSelected}
          onChange={onSelectAll}
        />
        <Box sx={{ width: 40 }} /> {/* Icon spacer */}
        <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
          Name
        </Typography>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ width: 140, display: { xs: "none", md: "block" } }}
        >
          Owner
        </Typography>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            width: 80,
            textAlign: "right",
            display: { xs: "none", sm: "block" },
          }}
        >
          Size
        </Typography>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ width: 100, textAlign: "right" }}
        >
          Modified
        </Typography>
        <Box sx={{ width: 40 }} /> {/* Actions spacer */}
      </Box>

      {/* File rows */}
      <Box sx={{ py: 1 }}>
        {files.map((file) => (
          <FileRow
            key={file.id}
            file={file}
            selected={selectedIds.includes(file.id)}
            anySelected={anySelected}
            isMultiSelectMode={isMultiSelectMode}
            onSelect={onSelect}
            onClick={onFileClick}
            onDoubleClick={onFileDoubleClick}
            onLongPress={onFileLongPress}
            onDownload={onDownload}
            onRename={onRename}
            onDelete={onDelete}
            onShare={onShare}
            onPreview={onPreview}
            onHide={onHide}
          />
        ))}
      </Box>

      {/* Empty state */}
      {files.length === 0 && (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Typography color="text.secondary">No files found</Typography>
        </Box>
      )}
    </Box>
  );
};

export default FileList;
