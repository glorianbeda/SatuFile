import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    FormControlLabel,
    Switch,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Divider,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastProvider';
import { api } from '../../../api';

export const ProfileSettings: React.FC = () => {
    const { user, updateAuth } = useAuth();
    const toast = useToast();

    const [locale, setLocale] = useState(user?.locale || 'en');
    const [viewMode, setViewMode] = useState(user?.viewMode || 'list');
    const [hideDotfiles, setHideDotfiles] = useState(user?.hideDotfiles || false);
    const [singleClick, setSingleClick] = useState(user?.singleClick || false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedUser = await api.put<any>('/me', {
                locale,
                viewMode,
                hideDotfiles,
                singleClick,
            });
            // Update local auth state with new user data
            const token = localStorage.getItem('auth-token');
            if (token) {
                updateAuth(token, { ...user, ...updatedUser });
            }
            toast.success('Pengaturan berhasil disimpan!');
        } catch (err) {
            toast.error('Gagal menyimpan pengaturan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Preferensi
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Language */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Bahasa</InputLabel>
                    <Select
                        value={locale}
                        label="Bahasa"
                        onChange={(e) => setLocale(e.target.value)}
                    >
                        <MenuItem value="id">Indonesia</MenuItem>
                        <MenuItem value="en">English</MenuItem>
                    </Select>
                </FormControl>

                {/* View Mode */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Tampilan File</InputLabel>
                    <Select
                        value={viewMode}
                        label="Tampilan File"
                        onChange={(e) => setViewMode(e.target.value)}
                    >
                        <MenuItem value="list">List</MenuItem>
                        <MenuItem value="grid">Grid</MenuItem>
                    </Select>
                </FormControl>

                {/* Toggles */}
                <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={hideDotfiles}
                                onChange={(e) => setHideDotfiles(e.target.checked)}
                            />
                        }
                        label="Sembunyikan file tersembunyi (.dotfiles)"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={singleClick}
                                onChange={(e) => setSingleClick(e.target.checked)}
                            />
                        }
                        label="Buka file dengan single click"
                    />
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{
                        background: 'linear-gradient(135deg, #1DA1F2 0%, #7856FF 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #0C7ABF 0%, #5C3DC9 100%)',
                        },
                    }}
                >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
            </CardContent>
        </Card>
    );
};

export default ProfileSettings;
