import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastProvider';
import { api } from '@/api';
import LanguageSelector from '@/components/common/LanguageSelector';
import i18n from '@/i18n/config';

export const ProfileSettings: React.FC = () => {
    const { user, updateAuth } = useAuth();
    const toast = useToast();

    const [viewMode, setViewMode] = useState(user?.viewMode || 'list');
    const [hideDotfiles, setHideDotfiles] = useState(user?.hideDotfiles || false);
    const [singleClick, setSingleClick] = useState(user?.singleClick || false);
    const [loading, setLoading] = useState(false);
    const [, forceUpdate] = useState({});

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedUser = await api.put<any>('/me', {
                viewMode,
                hideDotfiles,
                singleClick,
            });
            const token = localStorage.getItem('auth-token');
            if (token) {
                updateAuth(token, { ...user, ...updatedUser });
            }
            toast.success(i18n.t('settings:profileUpdated'));
        } catch (err) {
            toast.error(i18n.t('settings:profileUpdateError'));
        } finally {
            setLoading(false);
        }
    };

    const t = (key: string, ns: string = 'common') => i18n.t(`${ns}:${key}`);

    useEffect(() => {
        const handleLanguageChange = () => {
            forceUpdate({});
        };

        i18n.on('languageChanged', handleLanguageChange);

        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, []);

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {t('title', 'settings')}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Language */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('language', 'common')}
                    </Typography>
                    <LanguageSelector syncToBackend={true} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {t('languageSelectorHint', 'settings')}
                    </Typography>
                </Box>

                {/* View Mode */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>{t('files', 'settings')}</InputLabel>
                    <Select
                        value={viewMode}
                        label={t('files', 'settings')}
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
                        label={t('hideDotfiles', 'settings')}
                    />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={singleClick}
                                onChange={(e) => setSingleClick(e.target.checked)}
                            />
                        }
                        label={t('singleClick', 'settings')}
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
                    {loading ? t('loading', 'common') : t('save', 'common')}
                </Button>
            </CardContent>
        </Card>
    );
};

export default ProfileSettings;
