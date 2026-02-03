import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Card,
	CardContent,
	Typography,
	Alert,
} from "@mui/material";
import { CheckCircle, CloudQueue, Storage } from "@mui/icons-material";
import { Button } from "../../../components/common";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../api";

interface SetupCompleteStepProps {
	username: string;
	allocatedGb: number;
}

export const SetupCompleteStep: React.FC<SetupCompleteStepProps> = ({
	username,
	allocatedGb,
}) => {
	const navigate = useNavigate();
	const { updateAuth } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleContinue = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await api.post<{ token: string; user: any }>("/setup/complete");

			// Update global auth state immediately
			if (data.token && data.user) {
				updateAuth(data.token, data.user);
			}

			// Navigate to home
			navigate("/", { replace: true });
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to complete setup"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardContent sx={{ p: 4, textAlign: "center" }}>
				<CheckCircle
					sx={{
						fontSize: 64,
						color: "success.main",
						mb: 2,
					}}
				/>

				<Typography variant="h4" gutterBottom fontWeight="bold">
					Setup Complete!
				</Typography>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
					Your cloud storage is ready to use.
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 3, mx: "auto", maxWidth: 400 }}>
						{error}
					</Alert>
				)}

				{/* Summary Box */}
				<Box
					sx={{
						maxWidth: 400,
						mx: "auto",
						textAlign: "left",
						mb: 4,
					}}
				>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						SETUP SUMMARY
					</Typography>

					<SummaryItem
						icon={<CloudQueue />}
						label="Username"
						value={username}
					/>

					<SummaryItem
						icon={<Storage />}
						label="Storage Allocated"
						value={`${allocatedGb} GB`}
					/>

					<SummaryItem
						icon={<CheckCircle color="success" />}
						label="Password"
						value="Changed"
					/>
				</Box>

				<Button
					onClick={handleContinue}
					variant="contained"
					size="large"
					loading={loading}
					sx={{ minWidth: 200 }}
				>
					Continue to App
				</Button>
			</CardContent>
		</Card>
	);
};

interface SummaryItemProps {
	icon: React.ReactNode;
	label: string;
	value: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ icon, label, value }) => {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 2,
				py: 1.5,
				borderBottom: 1,
				borderColor: "divider",
			}}
		>
			<Box sx={{ color: "primary.main" }}>{icon}</Box>
			<Box sx={{ flex: 1 }}>
				<Typography variant="body2" color="text.secondary">
					{label}
				</Typography>
			</Box>
			<Typography variant="body2" fontWeight="medium">
				{value}
			</Typography>
		</Box>
	);
};
