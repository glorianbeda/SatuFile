import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { filesApi } from '@/api/files';

export const StorageIndicator = () => {
    const navigate = useNavigate();
    const [usage, setUsage] = useState<{ used: number; total: number } | null>(null);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const data = await filesApi.getStorageUsage();
                setUsage(data);
            } catch (err) {
                console.error("Failed to load storage usage", err);
            }
        };
        fetchUsage();
        
        // Refresh every minute?
        const interval = setInterval(fetchUsage, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!usage) return null;

    const percent = usage.total > 0 ? Math.min(100, Math.max(0, (usage.used / usage.total) * 100)) : 0;
    const color = percent >= 90 ? 'error' : percent >= 80 ? 'warning' : 'primary';
    
    // Format bytes
    const formatBytes = (bytes: number) => {
        const gb = bytes / (1024 * 1024 * 1024);
        return `${gb.toFixed(1)} GB`;
    };

    return (
        <Paper 
            elevation={0}
            sx={{ 
                p: 2, 
                bgcolor: 'background.default', 
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={() => navigate('/storage')}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="medium">Storage</Typography>
                <Typography variant="caption" color="text.secondary">
                    {formatBytes(usage.used)} / {formatBytes(usage.total)}
                </Typography>
            </Box>
            <LinearProgress 
                variant="determinate" 
                value={percent} 
                color={color} 
                sx={{ height: 6, borderRadius: 3 }}
            />
        </Paper>
    );
};
