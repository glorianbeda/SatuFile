import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
	Box,
	Button,
	Card,
	CardContent,
	Typography,
} from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface Props {
	children: ReactNode;
	onRetry?: () => void;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

/**
 * Error boundary for the setup wizard
 * Catches JavaScript errors anywhere in the child component tree
 */
export class SetupErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Setup Wizard Error:', error, errorInfo);
	}

	private handleRetry = () => {
		this.setState({ hasError: false, error: null });
		if (this.props.onRetry) {
			this.props.onRetry();
		}
	};

	private handleReload = () => {
		window.location.reload();
	};

	public render() {
		if (this.state.hasError) {
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
					<Card sx={{ maxWidth: 500, width: '100%' }}>
						<CardContent sx={{ p: 4, textAlign: 'center' }}>
							<ErrorOutline
								sx={{
									fontSize: 64,
									color: 'error.main',
									mb: 2,
								}}
							/>

							<Typography variant="h5" gutterBottom fontWeight="bold">
								Something went wrong
							</Typography>

							<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
								{this.state.error?.message || 'An unexpected error occurred during setup.'}
							</Typography>

							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
								<Button
									variant="contained"
									startIcon={<Refresh />}
									onClick={this.handleRetry}
									fullWidth
								>
									Try Again
								</Button>
								<Button
									variant="outlined"
									onClick={this.handleReload}
									fullWidth
								>
									Reload Page
								</Button>
							</Box>

							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ display: 'block', mt: 3 }}
							>
								If the problem persists, please contact support.
							</Typography>
						</CardContent>
					</Card>
				</Box>
			);
		}

		return this.props.children;
	}
}
