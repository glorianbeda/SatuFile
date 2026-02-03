import React, { useState, useEffect } from "react";
import {
	Box,
	Container,
	Typography,
	Alert,
	CircularProgress,
} from "@mui/material";
import { CloudQueue } from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../api"; // Import the configured api client
import { SetupProgress } from "../components/SetupProgress";
import { PasswordSetupStep } from "../components/PasswordSetupStep";
import { DriveSelectionStep } from "../components/DriveSelectionStep";
import { PartitionSetupStep } from "../components/PartitionSetupStep";
import { SetupCompleteStep } from "../components/SetupCompleteStep";
import { SetupErrorBoundary } from "../components/SetupErrorBoundary";

type SetupStep = "password" | "drive" | "partition" | "complete";

interface DriveData {
	drive: string;
	size_gb: number;
}

export const SetupWizardPage: React.FC = () => {
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState<SetupStep>("password");
	const [completedSteps, setCompletedSteps] = useState<number[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [driveData, setDriveData] = useState<DriveData | null>(null);

	useEffect(() => {
		loadSetupStatus();
	}, []);

	const loadSetupStatus = async () => {
		setLoading(true);
		setError("");
		try {
			// Use api.get instead of fetch to ensure Authorization header is included
			const data = await api.get<{ required: boolean; step: string }>("/setup/status");

			if (!data.required) {
				// Setup already complete, redirect to home
				window.location.href = "/";
				return;
			}

			// Set current step from server
			setCurrentStep((data.step as SetupStep) || "password");

			// Set completed steps based on current step
			const stepIndex = ["password", "drive", "partition", "complete"].indexOf(
				data.step || "password"
			);
			setCompletedSteps(Array.from({ length: stepIndex }, (_, i) => i));
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to load setup status"
			);
		} finally {
			setLoading(false);
		}
	};

	const getStepIndex = (): number => {
		return ["password", "drive", "partition", "complete"].indexOf(currentStep);
	};

	const handlePasswordSuccess = () => {
		const newCompleted = [...completedSteps, 0];
		setCompletedSteps(newCompleted);
		setCurrentStep("drive");
	};

	const handleDriveContinue = (drive: string) => {
		// Find the drive info when we implement it
		// For now, just set a default size
		setDriveData({ drive, size_gb: 100 });
		const newCompleted = [...completedSteps, 1];
		setCompletedSteps(newCompleted);
		setCurrentStep("partition");
	};

	const handlePartitionSuccess = () => {
		const newCompleted = [...completedSteps, 2];
		setCompletedSteps(newCompleted);
		setCurrentStep("complete");
	};

	const handleBack = () => {
		const steps: SetupStep[] = ["password", "drive", "partition", "complete"];
		const currentIndex = steps.indexOf(currentStep);
		if (currentIndex > 0) {
			setCurrentStep(steps[currentIndex - 1]);
			setCompletedSteps(completedSteps.slice(0, -1));
		}
	};

	if (loading) {
		return (
			<Box
				sx={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Box sx={{ textAlign: "center" }}>
					<CircularProgress />
					<Typography sx={{ mt: 2 }}>Loading setup...</Typography>
				</Box>
			</Box>
		);
	}

	return (
		<SetupErrorBoundary onRetry={() => window.location.reload()}>
			<Box
				sx={{
					minHeight: "100vh",
					bgcolor: "background.default",
					py: 4,
				}}
			>
				<Container maxWidth="md">
					{/* Header */}
					<Box sx={{ textAlign: "center", mb: 4 }}>
						<CloudQueue sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
						<Typography variant="h4" fontWeight="bold">
							SatuFile Setup
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Complete these steps to start using your cloud storage
						</Typography>
					</Box>

					{error && (
						<Alert severity="error" sx={{ mb: 3 }}>
							{error}
						</Alert>
					)}

					{/* Progress Indicator */}
					<SetupProgress
						currentStep={getStepIndex()}
						completedSteps={completedSteps}
					/>

					{/* Steps */}
					{currentStep === "password" && (
						<PasswordSetupStep
							onSuccess={handlePasswordSuccess}
						/>
					)}

					{currentStep === "drive" && (
						<DriveSelectionStep
							onSelect={handleDriveContinue}
							onBack={handleBack}
						/>
					)}

					{currentStep === "partition" && driveData && (
						<PartitionSetupStep
							drive={driveData.drive}
							driveSize={driveData.size_gb}
							onSuccess={handlePartitionSuccess}
							onBack={handleBack}
						/>
					)}

					{currentStep === "complete" && (
						<SetupCompleteStep
							username={user?.username || ""}
							allocatedGb={driveData?.size_gb || 0}
						/>
					)}
				</Container>
			</Box>
		</SetupErrorBoundary>
	);
};
