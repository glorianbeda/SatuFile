import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
} from '@mui/material';
import { CreateNewFolder } from '@mui/icons-material';

interface NewFolderDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (folderName: string) => Promise<void>;
    currentPath: string;
}

export const NewFolderDialog: React.FC<NewFolderDialogProps> = ({
    open,
    onClose,
    onSubmit,
    currentPath,
}) => {
    const [folderName, setFolderName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!folderName.trim()) {
            setError('Nama folder tidak boleh kosong');
            return;
        }

        // Validate folder name
        if (/[\/\\:*?"<>|]/.test(folderName)) {
            setError('Nama folder mengandung karakter tidak valid');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onSubmit(folderName.trim());
            setFolderName('');
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal membuat folder');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFolderName('');
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreateNewFolder color="primary" />
                Folder Baru
            </DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Nama Folder"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        error={!!error}
                        helperText={error || (folderName.startsWith('.') ? "Folder akan tersembunyi. Aktifkan 'Tampilkan file tersembunyi' di pengaturan untuk melihatnya." : `Akan dibuat di: ${currentPath === '/' ? '/' : currentPath + '/'}`)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !loading) {
                                handleSubmit();
                            }
                        }}
                        disabled={loading}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Batal
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !folderName.trim()}
                >
                    {loading ? 'Membuat...' : 'Buat Folder'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewFolderDialog;
