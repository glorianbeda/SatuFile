import React, { useState } from "react";
import {
	Box,
	Card,
	CardContent,
	TextField,
	Typography,
	Alert,
	Slider,
} from "@mui/material";
import { Storage, Folder } from "@mui/icons-material";
import { Button } from "../../../components/common";
import { api } from "../../../api";

interface PartitionSetupStepProps {
	drive: string;
	driveSize: number;
	onSuccess: () => void;
	onBack: () => void;
}

export const PartitionSetupStep: React.FC<PartitionSetupStepProps> = ({
	drive,
	driveSize,
	onSuccess,
	onBack,
}) => {
	const [sizeGb, setSizeGb] = useState(Math.max(1, Math.floor(driveSize * 0.5)));
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	// Calculate max available (leave some buffer for system)
	const maxAvailable = Math.floor(driveSize * 0.95);
	const minSize = 1;

	const validateSize = (): string | null => {
		if (sizeGb < minSize) {
			return `Minimum size is ${minSize} GB`;
		}
		if (sizeGb > maxAvailable) {
			return `Maximum available size is ${maxAvailable} GB`;
		}
		return null;
	};

	const handleSliderChange = (_event: Event, newValue: number | number[]) => {
		setSizeGb(newValue as number);
		setError("");
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);
		setSizeGb(isNaN(value) ? minSize : value);
		setError("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		const validationError = validateSize();
		if (validationError) {
			setError(validationError);
			return;
		}

		setLoading(true);
		try {
			await api.post("/setup/partition", {
				drive,
				size_gb: sizeGb,
			});
			onSuccess();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create partition");
		} finally {
			setLoading(false);
		}
	};

	const formatSize = (gb: number) => {
		if (gb >= 1000) {
			return `${(gb / 1024).toFixed(1)} TB`;
		}
		return `${gb.toFixed(0)} GB`;
	};

	const isValid = validateSize() === null;

	return (
		<Card>
			<CardContent sx={{ p: 4 }}>
				<Typography variant="h5" gutterBottom fontWeight="bold">
					Create Storage Partition
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Allocate storage space for your cloud files on the selected drive.
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				{/* Drive Info Card */}
				<Box
					sx={{
						p: 2,
						border: 1,
						borderColor: "divider",
						borderRadius: 2,
						mb: 3,
						bgcolor: "action.hover",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
						<Storage color="primary" />
						<Box>
							<Typography variant="subtitle2" fontWeight="bold">
								{drive === "/" ? "Root Drive" : drive}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{formatSize(driveSize)} available
							</Typography>
						</Box>
					</Box>
				</Box>

				<form onSubmit={handleSubmit}>
					<Typography variant="subtitle1" gutterBottom fontWeight="medium">
						Partition Size
					</Typography>

					<Box sx={{ px: 1, mb: 2 }}>
						<Slider
							value={sizeGb}
							onChange={handleSliderChange}
							min={minSize}
							max={maxAvailable}
							step={1}
							valueLabelDisplay="auto"
							valueLabelFormat={(value) => `${value} GB`}
							sx={{
								"& .MuiSlider-thumb": {
									width: 24,
									height: 24,
								},
							}}
						/>
					</Box>

					<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
						<TextField
							label="Size (GB)"
							type="number"
							value={sizeGb}
							onChange={handleInputChange}
							inputProps={{
								min: minSize,
								max: maxAvailable,
							}}
							sx={{ width: 150 }}
							error={!!validateSize()}
						/>
						<Typography variant="body2" color="text.secondary">
							of {formatSize(driveSize)} available
						</Typography>
					</Box>

					{/* Partition Preview */}
					<Box
						sx={{
							p: 2,
							border: 1,
							borderColor: "divider",
							borderRadius: 2,
							mb: 3,
							bgcolor: "info.50",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
							<Folder fontSize="small" color="info" />
							<Typography variant="subtitle2" fontWeight="bold">
								Your storage will be created at:
							</Typography>
						</Box>
						<Typography variant="body2" sx={{ fontFamily: "monospace", ml: 3 }}>
							{drive}/data/cloud-storage/
						</Typography>
					</Box>

					<Box sx={{ display: "flex", gap: 2 }}>
						<Button
							onClick={onBack}
							variant="outlined"
							sx={{ flex: 1 }}
							disabled={loading}
						>
							Back
						</Button>
						<Button
							type="submit"
							variant="contained"
							sx={{ flex: 1 }}
							disabled={!isValid || loading}
							loading={loading}
						>
							Create Partition
						</Button>
					</Box>
				</form>
			</CardContent>
		</Card>
	);
};
