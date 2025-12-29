import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Divider,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { Lock, Check, Close } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastProvider';
import { api } from '../../../api';

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

export const SecuritySettings: React.FC = () => {
    const { user, updateAuth } = useAuth();
    const toast = useToast();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const passedRequirements = requirements.filter((r) => r.test(newPassword)).length;
    const strengthPercent = (passedRequirements / requirements.length) * 100;
    const allRequirementsMet = passedRequirements === requirements.length;
    const passwordsMatch = newPassword === confirmPassword;
    const canSubmit = allRequirementsMet && passwordsMatch && currentPassword && !loading;

    const getStrengthColor = () => {
        if (strengthPercent < 50) return 'error';
        if (strengthPercent < 100) return 'warning';
        return 'success';
    };

    const handleChangePassword = async () => {
        if (!canSubmit) return;

        setLoading(true);
        try {
            const response = await api.post<{ token: string; user: any }>('/change-password', {
                currentPassword,
                newPassword,
                newUsername: newUsername || undefined,
            });

            updateAuth(response.token, response.user);
            toast.success('Password berhasil diubah!');

            // Reset form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setNewUsername('');
        } catch (err: any) {
            // Better error handling - extract message from various formats
            let errorMessage = 'Gagal mengubah password';
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.data.error) {
                    errorMessage = err.response.data.error;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lock fontSize="small" /> Keamanan
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Username Change */}
                <TextField
                    fullWidth
                    label="Username Baru (Opsional)"
                    placeholder={user?.username}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    margin="normal"
                    helperText="Kosongkan jika tidak ingin mengubah username"
                />

                <Divider sx={{ my: 3 }} />

                {/* Current Password */}
                <TextField
                    fullWidth
                    type="password"
                    label="Password Saat Ini"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    margin="normal"
                    required
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
                />

                {/* Strength Indicator */}
                {newPassword && (
                    <Box sx={{ mt: 1, mb: 2 }}>
                        <LinearProgress
                            variant="determinate"
                            value={strengthPercent}
                            color={getStrengthColor()}
                            sx={{ height: 8, borderRadius: 1 }}
                        />
                    </Box>
                )}

                {/* Requirements Checklist */}
                {newPassword && (
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
                )}

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

                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        disabled={!canSubmit}
                        color="error"
                        sx={{ px: 4 }}
                    >
                        {loading ? 'Menyimpan...' : 'Ubah Password'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default SecuritySettings;
