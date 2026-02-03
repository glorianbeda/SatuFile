import React from "react";
import { Box, Step, StepLabel, Stepper } from "@mui/material";
import { Check } from "@mui/icons-material";

interface SetupProgressProps {
	currentStep: number;
	completedSteps: number[];
}

const steps = [
	{ label: "Change Password", key: "password" },
	{ label: "Select Drive", key: "drive" },
	{ label: "Create Partition", key: "partition" },
];

export const SetupProgress: React.FC<SetupProgressProps> = ({
	currentStep,
	completedSteps,
}) => {
	return (
		<Box sx={{ mb: 4 }}>
			<Stepper
				activeStep={currentStep}
				alternativeLabel
				sx={{
					"& .MuiStepLabel-root .Mui-completed": {
						color: "success.main", // circle color for completed
					},
					"& .MuiStepLabel-root .Mui-active": {
						color: "primary.main", // circle color for active
					},
					"& .MuiStepLabel-root .Mui-disabled .MuiStepIcon-text": {
						fill: "rgba(255,255,255,0.5)", // text color for disabled
					},
				}}
			>
				{steps.map((step, index) => {
					const isCompleted = completedSteps.includes(index);
					return (
						<Step key={step.key} completed={isCompleted}>
							<StepLabel
								StepIconComponent={
									isCompleted ? () => (
										<Box
											sx={{
												backgroundColor: "success.main",
												color: "white",
												borderRadius: "50%",
												width: 24,
												height: 24,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<Check sx={{ fontSize: 16 }} />
										</Box>
									) : undefined
								}
							>
								{step.label}
							</StepLabel>
						</Step>
					);
				})}
			</Stepper>
		</Box>
	);
};
