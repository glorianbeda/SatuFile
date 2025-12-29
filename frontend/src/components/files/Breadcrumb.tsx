import React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Home, NavigateNext } from '@mui/icons-material';

interface BreadcrumbProps {
    currentPath: string;
    onNavigate: (path: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPath, onNavigate }) => {
    // Parse path into segments
    const segments = currentPath
        .split('/')
        .filter((s) => s.length > 0);

    // Build paths for each segment
    const paths: { name: string; path: string }[] = [
        { name: 'Home', path: '/' }
    ];

    let accPath = '';
    for (const segment of segments) {
        accPath += '/' + segment;
        paths.push({ name: segment, path: accPath });
    }

    return (
        <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            sx={{
                mb: 2,
                '& .MuiBreadcrumbs-li': {
                    display: 'flex',
                    alignItems: 'center',
                },
            }}
        >
            {paths.map((item, index) => {
                const isLast = index === paths.length - 1;

                if (isLast) {
                    return (
                        <Typography
                            key={item.path}
                            color="text.primary"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                fontWeight: 500,
                            }}
                        >
                            {index === 0 && <Home fontSize="small" />}
                            {item.name}
                        </Typography>
                    );
                }

                return (
                    <Link
                        key={item.path}
                        underline="hover"
                        color="inherit"
                        onClick={() => onNavigate(item.path)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: 'pointer',
                            '&:hover': {
                                color: 'primary.main',
                            },
                        }}
                    >
                        {index === 0 && <Home fontSize="small" />}
                        {item.name}
                    </Link>
                );
            })}
        </Breadcrumbs>
    );
};

export default Breadcrumb;
