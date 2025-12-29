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
import { Edit } from '@mui/icons-material';

interface RenameDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (newName: string) => Promise<void>;
    currentName: string;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({
    open,
    onClose,
    onSubmit,
    currentName,
}) => {
    const [name, setName] = useState(currentName);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (open) {
            setName(currentName);
            setError(null);
        }
    }, [open, currentName]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Nama tidak boleh kosong');
            return;
        }

        if (name === currentName) {
            onClose();
            return;
        }

        // Validate name
        if (/[\/\\:*?"<>|]/.test(name)) {
            setError('Nama mengandung karakter tidak valid');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onSubmit(name.trim());
            onClose();
        } catch (err: any) {
            setError(err.response?.data || 'Gagal mengganti nama');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Edit color="primary" />
                Ganti Nama
            </DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Nama Baru"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={!!error}
                        helperText={error}
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
                <Button onClick={onClose} disabled={loading}>
                    Batal
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !name.trim() || name === currentName}
                >
                    {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RenameDialog;
