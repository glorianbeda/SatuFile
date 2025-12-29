import React, { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';

interface ThumbnailImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
    src,
    alt,
    width = 80,
    height = 80,
}) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchImage = async () => {
            try {
                setLoading(true);
                setError(false);

                // Fetch with credentials and auth header
                const token = localStorage.getItem('auth-token');
                const response = await fetch(src, {
                    credentials: 'include',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!response.ok) throw new Error('Failed to load image');

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                if (isMounted) {
                    setImageSrc(objectUrl);
                    setLoading(false);
                }
            } catch {
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
            // Clean up blob URL
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [src]);

    if (loading) {
        return (
            <Skeleton
                variant="rounded"
                width={width}
                height={height}
                sx={{ borderRadius: 1 }}
            />
        );
    }

    if (error || !imageSrc) {
        return null; // Will fallback to icon in parent
    }

    return (
        <Box
            component="img"
            src={imageSrc}
            alt={alt}
            sx={{
                width,
                height,
                objectFit: 'cover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
            }}
        />
    );
};

export default ThumbnailImage;
