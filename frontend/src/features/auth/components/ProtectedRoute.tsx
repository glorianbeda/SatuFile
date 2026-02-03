import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

// Whitelist of routes that bypass setup check
const SETUP_WHITELIST = ['/setup', '/setup/', '/login'];

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAdmin = false
}) => {
    const { isAuthenticated, isLoading, user, setupRequired } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && user && !user.perm.admin) {
        return <Navigate to="/" replace />;
    }

    // Check if setup is required and route is not whitelisted
    if (setupRequired && !SETUP_WHITELIST.some(path => location.pathname.startsWith(path))) {
        return <Navigate to="/setup" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
