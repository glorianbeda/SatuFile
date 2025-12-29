import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'loading'> {
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    loading = false,
    disabled,
    startIcon,
    ...props
}) => {
    return (
        <MuiButton
            {...props}
            disabled={disabled || loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : startIcon}
        >
            {children}
        </MuiButton>
    );
};

export default Button;
