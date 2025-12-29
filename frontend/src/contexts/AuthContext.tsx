import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { api } from '../api';

interface User {
    id: number;
    username: string;
    email?: string;
    scope: string;
    locale: string;
    viewMode: string;
    hideDotfiles: boolean;
    singleClick: boolean;
    mustChangePassword: boolean;
    createdAt?: string;
    perm: {
        admin: boolean;
        execute: boolean;
        create: boolean;
        rename: boolean;
        modify: boolean;
        delete: boolean;
        share: boolean;
        download: boolean;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    mustChangePassword: boolean;
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, password: string, email?: string) => Promise<void>;
    logout: () => void;
    updateAuth: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('auth-token');
    });
    const [isLoading, setIsLoading] = useState(true);

    // Load user on mount if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const userData = await api.get<User>('/me');
                    setUser(userData);
                } catch {
                    // Token invalid, clear it
                    localStorage.removeItem('auth-token');
                    setToken(null);
                }
            }
            setIsLoading(false);
        };
        loadUser();
    }, [token]);

    const login = useCallback(async (username: string, password: string) => {
        const response = await api.post<{ token: string; user: User }>('/login', {
            username,
            password,
        });

        localStorage.setItem('auth-token', response.token);
        setToken(response.token);
        setUser(response.user);
    }, []);

    const signup = useCallback(async (username: string, password: string, email?: string) => {
        await api.post('/signup', {
            username,
            password,
            email,
        });
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('auth-token');
        setToken(null);
        setUser(null);
    }, []);

    // Called after password change to update token/user
    const updateAuth = useCallback((newToken: string, newUser: User) => {
        localStorage.setItem('auth-token', newToken);
        setToken(newToken);
        setUser(newUser);
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        mustChangePassword: user?.mustChangePassword ?? false,
        login,
        signup,
        logout,
        updateAuth,
    }), [user, token, isLoading, login, signup, logout, updateAuth]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
