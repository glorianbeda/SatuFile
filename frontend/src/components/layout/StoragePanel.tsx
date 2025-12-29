import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress as MuiCircularProgress,
    Skeleton,
} from '@mui/material';
import {
    Description,
    Image,
    VideoLibrary,
    AudioFile,
    Folder,
} from '@mui/icons-material';
import { filesApi } from '../../api';

interface StorageCategory {
    name: string;
    size: number; // in bytes
    color: string;
    icon: React.ReactNode;
}

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const bytesToGB = (bytes: number): number => {
    return bytes / (1024 * 1024 * 1024);
};

const categoryConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    Documents: { color: '#1DA1F2', icon: <Description /> },
    Pictures: { color: '#7856FF', icon: <Image /> },
    Videos: { color: '#17BF63', icon: <VideoLibrary /> },
    Audio: { color: '#FFAD1F', icon: <AudioFile /> },
    Downloads: { color: '#657786', icon: <Folder /> },
};

export const StoragePanel: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [used, setUsed] = useState(0);
    const [total, setTotal] = useState(0);
    const [categories, setCategories] = useState<StorageCategory[]>([]);

    useEffect(() => {
        const fetchStorage = async () => {
            try {
                const data = await filesApi.getStorage();
                setUsed(bytesToGB(data.used));
                setTotal(bytesToGB(data.total || 0));

                // Convert folders to categories
                const cats: StorageCategory[] = Object.entries(data.folders).map(([name, size]) => ({
                    name,
                    size: size,
                    color: categoryConfig[name]?.color || '#657786',
                    icon: categoryConfig[name]?.icon || <Folder />,
                }));

                // Sort by size descending
                cats.sort((a, b) => b.size - a.size);
                setCategories(cats);
            } catch (err) {
                console.error('Failed to fetch storage:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStorage();
    }, []);

    const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;
    const displayUsed = isNaN(used) || used === 0 ? '0' : used.toFixed(1);
    const displayTotal = isNaN(total) || total === 0 ? '0' : total.toFixed(0);

    return (
        <Box
            sx={{
                width: 280,
                bgcolor: 'background.paper',
                borderRadius: 3,
                p: 3,
                height: 'fit-content',
            }}
        >
            {/* Storage Usage Circle */}
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Storage usage
            </Typography>

            <Box
                sx={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    my: 3,
                }}
            >
                {/* Background circle */}
                <MuiCircularProgress
                    variant="determinate"
                    value={100}
                    size={160}
                    thickness={4}
                    sx={{ color: 'divider', position: 'absolute' }}
                />
                {/* Progress circle */}
                <MuiCircularProgress
                    variant="determinate"
                    value={loading ? 0 : percentage}
                    size={160}
                    thickness={4}
                    sx={{
                        color: percentage > 90 ? 'error.main' : percentage > 70 ? 'warning.main' : 'primary.main',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                            transition: 'stroke-dashoffset 0.5s ease',
                        },
                    }}
                />
                {/* Center text */}
                <Box
                    sx={{
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    {loading ? (
                        <Skeleton variant="text" width={60} height={40} />
                    ) : (
                        <>
                            <Typography variant="h4" fontWeight={700}>
                                {displayUsed}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                of {displayTotal} GB
                            </Typography>
                        </>
                    )}
                </Box>
            </Box>

            {/* Category breakdown */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                {loading ? (
                    // Loading skeleton
                    [...Array(5)].map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={56} />
                    ))
                ) : categories.length > 0 ? (
                    categories.map((cat) => (
                        <Box
                            key={cat.name}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'action.hover',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: 'action.selected',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: `${cat.color}20`,
                                    color: cat.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {cat.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={600}>
                                    {cat.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatBytes(cat.size)}
                                </Typography>
                            </Box>
                        </Box>
                    ))
                ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Tidak ada data
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default StoragePanel;
