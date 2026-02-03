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
    Alert,
    LinearProgress,
    Chip,
} from '@mui/material';
import { Save, Storage, Warning } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastProvider';
import { api } from '@/api';
import LanguageSelector from '@/components/common/LanguageSelector';
import i18n from '@/i18n/config';

export const ProfileSettings: React.FC = () => {
    const { user, updateAuth, setupRequired } = useAuth();
    const toast = useToast();

    const [viewMode, setViewMode] = useState(user?.viewMode || 'list');
    const [hideDotfiles, setHideDotfiles] = useState(user?.hideDotfiles || false);
    const [singleClick, setSingleClick] = useState(user?.singleClick || false);
    const [loading, setLoading] = useState(false);
    const [, forceUpdate] = useState({});

    // Calculate storage usage percentage
    const storageUsedPercent = user?.storageAllocationGb
        ? (user.storageAllocationGb > 0 ? 0 : 0) // TODO: Get actual usage from API
        : 0;

    const isStorageNearlyFull = storageUsedPercent >= 90;

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

                {/* Setup Status Alert */}
                {setupRequired && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                                You need to complete the setup process to continue using all features.
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => (window.location.href = '/setup')}
                                sx={{ ml: 2 }}
                            >
                                Complete Setup
                            </Button>
                        </Box>
                    </Alert>
                )}

                {/* Storage Information */}
                {user?.storageAllocationGb && user.storagePath && (
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Storage color="primary" />
                            <Typography variant="subtitle2" fontWeight="bold">
                                Storage Information
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                p: 2,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 2,
                                bgcolor: 'background.default',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Allocated Storage
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {user.storageAllocationGb} GB
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={storageUsedPercent}
                                    color={isStorageNearlyFull ? 'error' : 'primary'}
                                    sx={{ height: 8, borderRadius: 1 }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">
                                    Used: {user.storageAllocationGb * storageUsedPercent / 100} GB
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Available: {user.storageAllocationGb * (1 - storageUsedPercent / 100)} GB
                                </Typography>
                            </Box>

                            {isStorageNearlyFull && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                    <Warning color="error" fontSize="small" />
                                    <Typography variant="caption" color="error">
                                        Your storage is nearly full. Consider upgrading your plan.
                                    </Typography>
                                </Box>
                            )}

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Path: {user.storagePath}
                            </Typography>
                        </Box>
                    </Box>
                )}

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
