import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName: string;
  isDeleting?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  fileName,
  isDeleting = false,
}) => {
  const handleConfirm = () => {
    if (!isDeleting) {
      onConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: (theme) => theme.shadows[10],
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: "error.light",
                width: 40,
                height: 40,
              }}
            >
              <WarningIcon color="error" />
            </Avatar>
            <Typography variant="h6">Hapus File?</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" disabled={isDeleting}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
          Apakah Anda yakin ingin menghapus file ini?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          File: <strong>{fileName}</strong>
        </Typography>
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "error.light",
            color: "error.dark",
            borderRadius: 1,
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <WarningIcon sx={{ fontSize: 20, mt: 0.25 }} />
          <Typography variant="body2" sx={{ flex: 1 }}>
            Tindakan ini tidak dapat dibatalkan. File akan dihapus secara permanen
            dan tidak dapat dipulihkan.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={isDeleting}
          sx={{ mr: 1 }}
        >
          Batal
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          startIcon={
            isDeleting ? (
              <span
                className="spin"
                style={{
                  display: "inline-block",
                  animation: "spin 1s linear infinite",
                }}
              >
                ◌
              </span>
            ) : undefined
          }
        >
          {isDeleting ? "Menghapus..." : "Ya, Hapus"}
        </Button>
      </DialogActions>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
