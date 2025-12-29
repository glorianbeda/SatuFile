import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

interface ToastOptions {
    message: string;
    severity?: AlertColor;
    duration?: number;
}

interface ToastContextType {
    showToast: (options: ToastOptions) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('info');
    const [duration, setDuration] = useState(3000);

    const showToast = useCallback(({ message, severity = 'info', duration = 3000 }: ToastOptions) => {
        setMessage(message);
        setSeverity(severity);
        setDuration(duration);
        setOpen(true);
    }, []);

    const success = useCallback((message: string) => {
        showToast({ message, severity: 'success' });
    }, [showToast]);

    const error = useCallback((message: string) => {
        showToast({ message, severity: 'error', duration: 5000 });
    }, [showToast]);

    const warning = useCallback((message: string) => {
        showToast({ message, severity: 'warning' });
    }, [showToast]);

    const info = useCallback((message: string) => {
        showToast({ message, severity: 'info' });
    }, [showToast]);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    const value = useMemo(() => ({
        showToast,
        success,
        error,
        warning,
        info,
    }), [showToast, success, error, warning, info]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={duration}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={severity}
                    variant="filled"
                    sx={{ width: '100%', minWidth: 300 }}
                >
                    {message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
