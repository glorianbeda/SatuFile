import React, { useState } from "react";
import {
	Card,
	CardContent,
	TextField,
	Typography,
	Alert,
	InputAdornment,
	IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Button } from "../../../components/common";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../api";

interface PasswordSetupStepProps {
	onSuccess: () => void;
}

export const PasswordSetupStep: React.FC<PasswordSetupStepProps> = ({
	onSuccess,
}) => {
	const { updateAuth } = useAuth();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const validateForm = (): string | null => {
		if (!newPassword) {
			return "New password is required";
		}
		if (newPassword.length < 8) {
			return "New password must be at least 8 characters";
		}
		if (newPassword !== confirmPassword) {
			return "Passwords do not match";
		}
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		const validationError = validateForm();
		if (validationError) {
			setError(validationError);
			return;
		}

		setLoading(true);
		try {
			const data = await api.post<{ success: boolean; token: string; user: any }>("/setup/password", {
				// Current password optional for setup
				newPassword,
			});

			// Update global auth state immediately
			if (data.token && data.user) {
				updateAuth(data.token, data.user);
			}
			onSuccess();
		} catch (err) {
			// api client throws error with message from response
			setError(err instanceof Error ? err.message : "Failed to change password");
		} finally {
			setLoading(false);
		}
	};

	const isValid = validateForm() === null;

	return (
		<Card>
			<CardContent sx={{ p: 4 }}>
				<Typography variant="h5" gutterBottom fontWeight="bold">
					Set Your Password
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					For security, please set a new password for your account.
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<form onSubmit={handleSubmit}>
					<TextField
						fullWidth
						label="New Password"
						type={showNewPassword ? "text" : "password"}
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						margin="normal"
						required
						autoFocus
						helperText="Must be at least 8 characters"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										onClick={() => setShowNewPassword(!showNewPassword)}
										edge="end"
									>
										{showNewPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>

					<TextField
						fullWidth
						label="Confirm New Password"
						type={showConfirmPassword ? "text" : "password"}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						margin="normal"
						required
						error={!!confirmPassword && confirmPassword !== newPassword}
						helperText={
							confirmPassword && confirmPassword !== newPassword
								? "Passwords do not match"
								: ""
						}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										edge="end"
									>
										{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>

					<Button
						type="submit"
						fullWidth
						variant="contained"
						size="large"
						loading={loading}
						disabled={!isValid}
						sx={{ mt: 3, mb: 2 }}
					>
						Continue
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};
