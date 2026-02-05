import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, LinearProgress, Container, CircularProgress } from '@mui/material';
import { filesApi } from '@/api/files';

interface StorageStats {
    used: number;
    total: number;
    free: number;
    folders: Record<string, number>;
}

export const StoragePage = () => {
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await filesApi.getStorageStats();
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
        </Box>
    );
    
    if (!stats) return <Box p={3}>Failed to load storage stats</Box>;

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const usedPercent = stats.total > 0 ? (stats.used / stats.total) * 100 : 0;
    
    // Convert folders map to array and sort by size desc
    const folderList = Object.entries(stats.folders)
        .map(([name, size]) => ({ name, size }))
        .sort((a, b) => b.size - a.size);

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">Storage Analysis</Typography>
            
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Total Usage</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ flexGrow: 1, mr: 2 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={usedPercent} 
                            sx={{ height: 12, borderRadius: 6 }}
                            color={usedPercent > 90 ? "error" : usedPercent > 80 ? "warning" : "primary"}
                        />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight="bold">
                            {`${Math.round(usedPercent)}%`}
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {formatBytes(stats.used)} used of {formatBytes(stats.total)} ({formatBytes(stats.free)} free)
                </Typography>
            </Paper>
            
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Breakdown by Folder</Typography>
            <Grid container spacing={2}>
                {folderList.map((folder) => {
                    // Percentage relative to USED space (breakdown)
                    const folderPercent = stats.used > 0 ? (folder.size / stats.used) * 100 : 0;
                    return (
                        <Grid item xs={12} md={6} key={folder.name}>
                            <Paper sx={{ p: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="medium">{folder.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{formatBytes(folder.size)}</Typography>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={folderPercent} 
                                    color="secondary"
                                    sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover' }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {folderPercent.toFixed(1)}% of used space
                                </Typography>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
};
