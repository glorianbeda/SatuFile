import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Typography,
    Alert,
    Link,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, CloudQueue } from '@mui/icons-material';
import { Button } from '../../../components/common';
import { useAuth } from '../../../contexts/AuthContext';

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            await signup(username, password, email || undefined);
            navigate('/login', {
                state: { message: 'Account created successfully. Please sign in.' }
            });
        } catch (err: unknown) {
            if (err instanceof Error && err.message.includes('409')) {
                setError('Username already exists');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            <Card sx={{ maxWidth: 400, width: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <CloudQueue sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold">
                            SatuFile
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Create your account
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            margin="normal"
                            required
                            autoFocus
                            autoComplete="username"
                        />

                        <TextField
                            fullWidth
                            label="Email (optional)"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            autoComplete="email"
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                            autoComplete="new-password"
                            helperText="At least 8 characters"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            margin="normal"
                            required
                            autoComplete="new-password"
                            error={confirmPassword !== '' && password !== confirmPassword}
                            helperText={
                                confirmPassword !== '' && password !== confirmPassword
                                    ? 'Passwords do not match'
                                    : ''
                            }
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            loading={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Create Account
                        </Button>
                    </form>

                    <Typography variant="body2" textAlign="center">
                        Already have an account?{' '}
                        <Link component={RouterLink} to="/login">
                            Sign in
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SignupPage;
