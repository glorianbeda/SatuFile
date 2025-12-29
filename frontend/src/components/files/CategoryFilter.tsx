import React from 'react';
import { Box, Typography } from '@mui/material';
import {
    Description,
    Image,
    VideoLibrary,
    AudioFile,
    FolderOpen,
} from '@mui/icons-material';

interface Category {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

interface CategoryFilterProps {
    activeCategory?: string;
    onCategoryChange?: (categoryId: string | undefined) => void;
    fileCounts?: {
        documents?: number;
        image?: number;
        video?: number;
        audio?: number;
        total?: number;
    };
}

const categories: Category[] = [
    { id: 'documents', name: 'Documents', icon: <Description />, color: '#1DA1F2', bgColor: '#E8F5FE' },
    { id: 'image', name: 'Image', icon: <Image />, color: '#7856FF', bgColor: '#F3EFFF' },
    { id: 'video', name: 'Video', icon: <VideoLibrary />, color: '#17BF63', bgColor: '#E6F9EE' },
    { id: 'audio', name: 'Audio', icon: <AudioFile />, color: '#FFAD1F', bgColor: '#FFF8E6' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    activeCategory,
    onCategoryChange,
    fileCounts = {},
}) => {
    const handleClick = (id: string | undefined) => {
        if (id === undefined || activeCategory === id) {
            onCategoryChange?.(undefined);
        } else {
            onCategoryChange?.(id);
        }
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                All files
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    gap: 1.5,
                    overflowX: 'auto',
                    pb: 1,
                    '&::-webkit-scrollbar': { display: 'none' },
                    msOverflowStyle: 'none',
                }}
            >
                {/* All option */}
                <Box
                    onClick={() => handleClick(undefined)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        bgcolor: !activeCategory ? 'primary.main' : 'grey.100',
                        color: !activeCategory ? 'white' : 'text.secondary',
                        flexShrink: 0,
                        '&:hover': {
                            bgcolor: !activeCategory ? 'primary.dark' : 'grey.200',
                        },
                    }}
                >
                    <FolderOpen sx={{ fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={500}>
                        All
                    </Typography>
                    {fileCounts.total !== undefined && fileCounts.total > 0 && (
                        <Typography variant="caption" sx={{
                            bgcolor: !activeCategory ? 'rgba(255,255,255,0.2)' : 'grey.300',
                            px: 0.8,
                            py: 0.2,
                            borderRadius: 1,
                            fontWeight: 600,
                        }}>
                            {fileCounts.total}
                        </Typography>
                    )}
                </Box>

                {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const count = fileCounts[cat.id as keyof typeof fileCounts];
                    return (
                        <Box
                            key={cat.id}
                            onClick={() => handleClick(cat.id)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 2,
                                py: 1,
                                borderRadius: 3,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                bgcolor: isActive ? cat.color : cat.bgColor,
                                color: isActive ? 'white' : cat.color,
                                flexShrink: 0,
                                '&:hover': {
                                    bgcolor: isActive ? cat.color : `${cat.color}30`,
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', fontSize: 20 }}>
                                {cat.icon}
                            </Box>
                            <Typography variant="body2" fontWeight={500}>
                                {cat.name}
                            </Typography>
                            {count !== undefined && count > 0 && (
                                <Typography variant="caption" sx={{
                                    bgcolor: isActive ? 'rgba(255,255,255,0.2)' : `${cat.color}30`,
                                    px: 0.8,
                                    py: 0.2,
                                    borderRadius: 1,
                                    fontWeight: 600,
                                }}>
                                    {count}
                                </Typography>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default CategoryFilter;
