import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  ContentCopy,
  AccessTime,
  Folder as FolderIcon,
  Description as FileIcon,
} from "@mui/icons-material";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  fileType: "file" | "folder";
  shareUrl: string;
  onCopyLink: () => void;
  onCreateShare: (expiration: { expires: string; unit: string }) => void;
  isCreating?: boolean;
}

type ExpirationOption = {
  value: string;
  unit: string;
  label: string;
  hours: number;
  description: string;
};

const EXPIRATION_OPTIONS: ExpirationOption[] = [
  {
    value: "1",
    unit: "hours",
    label: "1 Jam",
    hours: 1,
    description: "Link berlaku 1 jam",
  },
  {
    value: "24",
    unit: "hours",
    label: "24 Jam",
    hours: 24,
    description: "Link berlaku 1 hari",
  },
  {
    value: "7",
    unit: "days",
    label: "7 Hari",
    hours: 24 * 7,
    description: "Link berlaku 1 minggu",
  },
  {
    value: "30",
    unit: "days",
    label: "30 Hari",
    hours: 24 * 30,
    description: "Link berlaku 1 bulan",
  },
  {
    value: "0",
    unit: "hours",
    label: "Permanen",
    hours: 0,
    description: "Link tidak pernah kadaluarsa",
  },
];

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  fileName,
  fileType,
  shareUrl,
  onCopyLink,
  onCreateShare,
  isCreating = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedExpiration, setSelectedExpiration] =
    useState<ExpirationOption>(EXPIRATION_OPTIONS[1]); // Default: 24 hours
  const [hasCreated, setHasCreated] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    onCopyLink();

    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateShare = () => {
    onCreateShare({
      expires: selectedExpiration.value,
      unit: selectedExpiration.unit,
    });
    setHasCreated(true);
  };

  const handleClose = () => {
    setHasCreated(false);
    setSelectedExpiration(EXPIRATION_OPTIONS[1]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <AccessTime color="primary" />
            <Typography variant="h6">
              {fileType === "folder" ? "Share Folder" : "Share File"}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {hasCreated
            ? `${fileType === "folder" ? "Folder" : "File"} berhasil dibagikan!`
            : `${fileType === "folder" ? "Share folder" : "Share file"}: "${fileName}"`}
        </Typography>

        {!hasCreated && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Durasi Link
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 1,
              }}
            >
              {EXPIRATION_OPTIONS.map((option) => (
                <Chip
                  key={option.value + option.unit}
                  label={option.label}
                  onClick={() => setSelectedExpiration(option)}
                  variant={
                    selectedExpiration.value === option.value &&
                      selectedExpiration.unit === option.unit
                      ? "filled"
                      : "outlined"
                  }
                  color={
                    selectedExpiration.value === option.value &&
                      selectedExpiration.unit === option.unit
                      ? "primary"
                      : "default"
                  }
                  clickable
                  size="small"
                  title={option.description}
                />
              ))}
            </Box>
            {selectedExpiration && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {selectedExpiration.description}
              </Typography>
            )}
          </Box>
        )}

        {hasCreated && shareUrl && (
          <TextField
            fullWidth
            label="Share Link"
            value={shareUrl}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Tooltip title={copied ? "Disalin!" : "Salin ke clipboard"}>
                  <IconButton onClick={handleCopy} edge="end">
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              ),
            }}
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: "action.hover",
              },
            }}
          />
        )}

        {hasCreated && (
          <Box
            sx={{ mt: 2, p: 1.5, bgcolor: "success.light", borderRadius: 1 }}
          >
            <Typography variant="body2" color="success.dark">
              ✓ Link share berhasil dibuat dengan durasi:{" "}
              {selectedExpiration.label}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {!hasCreated ? (
          <>
            <Button onClick={handleClose} color="inherit">
              Batal
            </Button>
            <Button
              onClick={handleCreateShare}
              variant="contained"
              disabled={isCreating}
              startIcon={
                isCreating ? (
                  <AccessTime sx={{ animation: "spin 1s linear infinite" }} />
                ) : undefined
              }
            >
              {isCreating ? "Membuat..." : "Buat Link Share"}
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} variant="contained" fullWidth>
            Tutup
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;
