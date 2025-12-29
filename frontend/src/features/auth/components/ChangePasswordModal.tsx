import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Alert,
} from '@mui/material';
import { Check, Close, Lock } from '@mui/icons-material';
import axios from 'axios';

interface ChangePasswordModalProps {
    open: boolean;
    currentUsername: string;
    onSuccess: (token: string, user: any) => void;
}

interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
    { label: 'Minimal 8 karakter', test: (p) => p.length >= 8 },
    { label: 'Minimal 1 huruf besar (A-Z)', test: (p) => /[A-Z]/.test(p) },
    { label: 'Minimal 1 angka (0-9)', test: (p) => /[0-9]/.test(p) },
    { label: 'Minimal 1 simbol (!@#$%...)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    open,
    currentUsername,
    onSuccess,
}) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const passedRequirements = requirements.filter((r) => r.test(newPassword)).length;
    const strengthPercent = (passedRequirements / requirements.length) * 100;
    const allRequirementsMet = passedRequirements === requirements.length;
    const passwordsMatch = newPassword === confirmPassword;
    const canSubmit = allRequirementsMet && passwordsMatch && confirmPassword && !loading;

    const getStrengthColor = () => {
        if (strengthPercent < 50) return 'error';
        if (strengthPercent < 100) return 'warning';
        return 'success';
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('auth-token');
            const response = await axios.post(
                '/api/change-password',
                {
                    newPassword,
                    newUsername: newUsername || undefined,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            onSuccess(response.data.token, response.data.user);
        } catch (err: any) {
            setError(err.response?.data || 'Gagal mengubah password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} maxWidth="sm" fullWidth disableEscapeKeyDown>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lock color="primary" />
                <Typography variant="h6">Buat Password Baru</Typography>
            </DialogTitle>

            <DialogContent>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Ini adalah login pertama Anda. Silakan buat password baru untuk keamanan.
                </Alert>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* New Username (Optional) */}
                <TextField
                    fullWidth
                    label="Username Baru (Opsional)"
                    placeholder={currentUsername}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    margin="normal"
                    helperText="Kosongkan jika tidak ingin mengubah username"
                />

                {/* New Password */}
                <TextField
                    fullWidth
                    type="password"
                    label="Password Baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    margin="normal"
                    required
                    autoFocus
                />

                {/* Strength Indicator */}
                <Box sx={{ mt: 1, mb: 2 }}>
                    <LinearProgress
                        variant="determinate"
                        value={strengthPercent}
                        color={getStrengthColor()}
                        sx={{ height: 8, borderRadius: 1 }}
                    />
                </Box>

                {/* Requirements Checklist */}
                <List dense sx={{ bgcolor: 'background.default', borderRadius: 2, mb: 2 }}>
                    {requirements.map((req, idx) => {
                        const passed = req.test(newPassword);
                        return (
                            <ListItem key={idx} sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    {passed ? (
                                        <Check color="success" fontSize="small" />
                                    ) : (
                                        <Close color="error" fontSize="small" />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={req.label}
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        color: passed ? 'success.main' : 'text.secondary',
                                    }}
                                />
                            </ListItem>
                        );
                    })}
                </List>

                {/* Confirm Password */}
                <TextField
                    fullWidth
                    type="password"
                    label="Konfirmasi Password Baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    margin="normal"
                    required
                    error={confirmPassword.length > 0 && !passwordsMatch}
                    helperText={confirmPassword.length > 0 && !passwordsMatch ? 'Password tidak cocok' : ''}
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    sx={{
                        background: canSubmit
                            ? 'linear-gradient(135deg, #1DA1F2 0%, #7856FF 100%)'
                            : undefined,
                    }}
                >
                    {loading ? 'Menyimpan...' : 'Simpan Password'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChangePasswordModal;
