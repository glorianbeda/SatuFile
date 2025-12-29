import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

// Twitter Blue Color Palette
const colors = {
    primary: {
        main: '#1DA1F2',
        light: '#71C9F8',
        dark: '#0C7ABF',
        contrastText: '#FFFFFF',
    },
    secondary: {
        main: '#7856FF',
        light: '#A183FF',
        dark: '#5C3DC9',
        contrastText: '#FFFFFF',
    },
    success: {
        main: '#17BF63',
        light: '#4DD88A',
        dark: '#11944C',
    },
    error: {
        main: '#E0245E',
        light: '#E8537E',
        dark: '#B01C4A',
    },
    warning: {
        main: '#FFAD1F',
        light: '#FFBF4C',
        dark: '#CC8A19',
    },
    text: {
        light: {
            primary: '#1C2B33',
            secondary: '#657786',
        },
        dark: {
            primary: '#FFFFFF',
            secondary: '#8899A6',
        },
    },
    background: {
        light: {
            default: '#F7F9FC',
            paper: '#FFFFFF',
        },
        dark: {
            default: '#15202B',
            paper: '#192734',
        },
    },
};

// Custom shadows
const customShadows = {
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 2px 8px rgba(0,0,0,0.08)',
    lg: '0 4px 16px rgba(0,0,0,0.12)',
    xl: '0 8px 32px rgba(0,0,0,0.16)',
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('theme-mode');
        return (saved as ThemeMode) || 'light';
    });

    const toggleTheme = useCallback(() => {
        setMode((prev) => {
            const next = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme-mode', next);
            return next;
        });
    }, []);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: colors.primary,
                    secondary: colors.secondary,
                    success: colors.success,
                    error: colors.error,
                    warning: colors.warning,
                    text: mode === 'light' ? colors.text.light : colors.text.dark,
                    background: mode === 'light' ? colors.background.light : colors.background.dark,
                },
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    h1: { fontWeight: 700, fontSize: '2.5rem' },
                    h2: { fontWeight: 700, fontSize: '2rem' },
                    h3: { fontWeight: 600, fontSize: '1.75rem' },
                    h4: { fontWeight: 600, fontSize: '1.5rem' },
                    h5: { fontWeight: 600, fontSize: '1.25rem' },
                    h6: { fontWeight: 600, fontSize: '1rem' },
                    subtitle1: { fontWeight: 500, fontSize: '1rem' },
                    subtitle2: { fontWeight: 500, fontSize: '0.875rem' },
                    body1: { fontSize: '1rem', lineHeight: 1.5 },
                    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
                    button: { textTransform: 'none', fontWeight: 600 },
                },
                shape: {
                    borderRadius: 12,
                },
                shadows: [
                    'none',
                    customShadows.sm,
                    customShadows.md,
                    customShadows.md,
                    customShadows.lg,
                    customShadows.lg,
                    customShadows.lg,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                    customShadows.xl,
                ],
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 24,
                                padding: '10px 24px',
                                fontWeight: 600,
                            },
                            contained: {
                                boxShadow: customShadows.md,
                                '&:hover': {
                                    boxShadow: customShadows.lg,
                                },
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 16,
                                boxShadow: customShadows.md,
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            },
                            rounded: {
                                borderRadius: 12,
                            },
                        },
                    },
                    MuiTextField: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 12,
                                },
                            },
                        },
                    },
                    MuiChip: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                            },
                        },
                    },
                    MuiIconButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    const contextValue = useMemo(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

    return (
        <ThemeContext.Provider value={contextValue}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

// Export colors and shadows for reuse
export { colors, customShadows };
export default ThemeProvider;
