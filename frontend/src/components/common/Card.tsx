import React from 'react';
import { Card as MuiCard, CardContent, CardHeader, CardActions } from '@mui/material';
import type { CardProps as MuiCardProps } from '@mui/material';

export interface CardProps extends MuiCardProps {
    title?: string;
    subheader?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    title,
    subheader,
    actions,
    children,
    ...props
}) => {
    return (
        <MuiCard {...props}>
            {(title || subheader) && (
                <CardHeader title={title} subheader={subheader} />
            )}
            <CardContent>{children}</CardContent>
            {actions && <CardActions>{actions}</CardActions>}
        </MuiCard>
    );
};

export default Card;
